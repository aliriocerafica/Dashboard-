"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import LoginForm from "../components/LoginForm";
import ITProgressStats from "../components/ITProgressStats";
import {
  fetchITData,
  calculateITStats,
  ITData,
  ITDashboardStats,
} from "../lib/sheets";
import { isAuthenticated, setAuthenticated } from "../lib/auth";
import {
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1OO2MhxCnpLYM3d2IuX7EFqVtGOZ4HvhE2SCgVei5hvs/edit?gid=489896504#gid=489896504";

interface ITTask {
  taskName: string;
  startDate: string;
  deadline: string;
  assignee: string;
  status: string;
  dateCompleted: string;
}

interface ITTaskData {
  tasks: ITTask[];
  summary: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    toDo: number;
    ongoing: number;
  };
}

export default function ITPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("itUpdate");
  const [data, setData] = useState<ITData[]>([]);
  const [stats, setStats] = useState<ITDashboardStats>({
    totalTickets: 0,
    resolvedTickets: 0,
    unresolvedTickets: 0,
    avgResolutionTime: "0s",
    employeeRating: 0,
    topAccount: "",
    topTroubleshootingType: "",
    satisfactionRate: 0,
    laptopReleases: 0,
    peripheralReleases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // IT Task states
  const [taskData, setTaskData] = useState<ITTaskData | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const itData = await fetchITData(GOOGLE_SHEET_URL);
      setData(itData);

      // Debug: Show sample data structure
      console.log("=== IT DATA DEBUG ===");
      console.log(`Total rows fetched: ${itData.length}`);

      if (itData.length > 0) {
        console.log("First row (header):", {
          timestamp: itData[0].timestamp,
          timeResolved: itData[0].timeResolved,
          calculatedResolutionTime: itData[0].calculatedResolutionTime,
          status: itData[0].status,
        });
      }

      if (itData.length > 1) {
        console.log("Second row:", {
          timestamp: itData[1].timestamp,
          timeResolved: itData[1].timeResolved,
          calculatedResolutionTime: itData[1].calculatedResolutionTime,
          status: itData[1].status,
        });
      }

      // Show a few sample tickets with time data
      const ticketsWithTime = itData
        .filter(
          (item) =>
            item.timeResolved &&
            item.timeResolved.trim() !== "" &&
            item.timestamp &&
            item.timestamp !== "timestamp"
        )
        .slice(0, 3);

      console.log(
        "Sample tickets with time data:",
        ticketsWithTime.map((ticket) => ({
          timestamp: ticket.timestamp,
          timeResolved: ticket.timeResolved,
          status: ticket.status,
        }))
      );

      console.log("=== END IT DATA DEBUG ===");

      const calculatedStats = calculateITStats(itData);
      setStats(calculatedStats);

      // Log to verify pre-calculated data is being used from columns O, P, Q
      console.log("=== IT Dashboard Stats ===");
      console.log("Avg Resolution Time:", calculatedStats.avgResolutionTime);
      console.log("Satisfaction Rate:", calculatedStats.satisfactionRate + "%");
      console.log("Total Tickets:", calculatedStats.totalTickets);
      console.log("Resolved:", calculatedStats.resolvedTickets);
      console.log("Laptop Releases:", calculatedStats.laptopReleases);
      console.log("Peripheral Releases:", calculatedStats.peripheralReleases);
      console.log("==========================");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskData = async () => {
    try {
      setTaskLoading(true);
      setTaskError(null);
      const response = await fetch(`/api/get-it-tasks?timestamp=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task data: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch task data");
      }

      setTaskData(result.data);
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : "Failed to load task data");
      console.error("Error loading task data:", err);
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === "itUpdate") {
        loadData();
      } else if (activeTab === "itTask" && !taskData) {
        loadTaskData();
      }
    }
  }, [isLoggedIn, activeTab]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading IT dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = "/home";
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter out header row for display
  const actualTicketData = data.filter((item) => {
    const timestamp = item.timestamp?.toLowerCase() || "";
    if (timestamp === "timestamp" || timestamp === "" || !timestamp) {
      return false;
    }
    const date = new Date(item.timestamp);
    return !isNaN(date.getTime());
  });

  const handleRefresh = () => {
    if (activeTab === "itUpdate") {
      loadData();
    } else {
      loadTaskData();
    }
  };

  const isCurrentLoading = activeTab === "itUpdate" ? loading : taskLoading;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              IT Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Track and manage support tickets and IT operations
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isCurrentLoading}
              className={`px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isCurrentLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <svg
                className={`w-4 h-4 ${isCurrentLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {isCurrentLoading ? "Refreshing..." : "Refresh Data"}
              </span>
            </button>
            <a
              href={activeTab === "itUpdate" ? GOOGLE_SHEET_URL : "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdFvtYrlz0LFExRnEoD2-c9K-8mmv0bkj5y-yEDIHEsdKiqYJdb_H7ioceOZWRe46m0tEl_n4KEsV1/pub?gid=297970600&single=true&output=csv"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span className="hidden sm:inline">View Original Sheet</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("itUpdate")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "itUpdate"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                IT Update
              </button>
              <button
                onClick={() => setActiveTab("itTask")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "itTask"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                IT Task
              </button>
            </nav>
          </div>
        </div>

        {/* IT Update Tab */}
        {activeTab === "itUpdate" && (
          <>
            {/* Row 1: KPI tiles (6 cols) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          {/* Total Tickets */}
          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <TicketIcon className="w-8 h-8 opacity-80" />
              <div className="text-sm font-medium opacity-90">
                Total Tickets
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalTickets}</div>
            <div className="text-sm opacity-80">All time</div>
          </div>

          {/* Resolved Tickets */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
              <div className="text-sm font-medium text-gray-600">Resolved</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.resolvedTickets}
            </div>
            <div className="text-sm text-gray-500">
              {stats.unresolvedTickets} pending
            </div>
          </div>

          {/* Avg Resolution Time */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">Avg Time</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.avgResolutionTime}
            </div>
            <div className="text-sm text-gray-500">Per ticket</div>
          </div>

          {/* Employee Rating */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <StarIcon className="w-8 h-8 text-amber-500" />
              <div className="text-sm font-medium text-gray-600">Rating</div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.satisfactionRate}%
            </div>
            <div className="text-sm text-gray-500">Satisfaction</div>
          </div>

          {/* Laptop Release */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ComputerDesktopIcon className="w-8 h-8 text-indigo-600" />
              <div className="text-sm font-medium text-gray-600">
                Laptop Release
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.laptopReleases}
            </div>
            <div className="text-sm text-gray-500">Total releases</div>
          </div>

          {/* Peripheral Release */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TicketIcon className="w-8 h-8 text-cyan-600" />
              <div className="text-sm font-medium text-gray-600">
                Peripheral Release
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.peripheralReleases}
            </div>
            <div className="text-sm text-gray-500">Total releases</div>
          </div>
        </div>

        {/* Row 2: Weekly Progress Stats */}
        <div className="mb-4">
          <ITProgressStats data={actualTicketData} />
        </div>

        {/* Row 3: Ticket Types + Recent Tickets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          {/* Troubleshooting Types */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Troubleshooting Types
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(
                  actualTicketData.reduce((acc, item) => {
                    if (item.troubleshootingType) {
                      const types = item.troubleshootingType
                        .split(",")
                        .map((t) => t.trim());
                      types.forEach((type) => {
                        acc[type] = (acc[type] || 0) + 1;
                      });
                    }
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {type}
                      </span>
                      <span className="text-xs font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {stats.resolvedTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unresolved</span>
                  <span className="text-lg font-bold text-red-600">
                    {stats.unresolvedTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats.totalTickets}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">
                    Satisfaction Rate
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.satisfactionRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Recent Tickets Table */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Tickets
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {actualTicketData.length} Total
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              + View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Account
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {actualTicketData.slice(0, 10).map((ticket, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-2 text-gray-600">
                      {ticket.timestamp.split(",")[0]}
                    </td>
                    <td className="py-3 px-2 text-gray-900 font-medium truncate max-w-xs">
                      {ticket.fullName || "N/A"}
                    </td>
                    <td className="py-3 px-2 text-gray-600 truncate max-w-xs">
                      {ticket.account}
                    </td>
                    <td className="py-3 px-2 text-gray-600 truncate max-w-xs">
                      {ticket.troubleshootingType.split(",")[0]}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {ticket.timeResolved || "N/A"}
                    </td>
                    <td className="py-3 px-2 text-gray-600">
                      {ticket.employeeRating || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {actualTicketData.length > 10 && (
            <div className="px-2 py-3 bg-gray-50/50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Showing 10 of {actualTicketData.length} results
              </p>
            </div>
          )}
        </div>
          </>
        )}

        {/* IT Task Tab */}
        {activeTab === "itTask" && (
          <>
            {taskLoading && !taskData && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <LoadingSpinner size="lg" text="Loading IT tasks..." />
              </div>
            )}

            {taskError && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Error Loading Task Data
                </h2>
                <p className="text-gray-600 mb-6">{taskError}</p>
                <button
                  onClick={loadTaskData}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {!taskLoading && !taskError && taskData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {/* Total Tasks */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <TicketIcon className="w-8 h-8 opacity-80" />
                      <div className="text-sm font-medium opacity-90">Total Tasks</div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{taskData.summary.totalTasks}</div>
                    <div className="text-sm opacity-80">All tasks</div>
                  </div>

                  {/* Completed */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircleIcon className="w-8 h-8 opacity-80" />
                      <div className="text-sm font-medium opacity-90">Completed</div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{taskData.summary.completed}</div>
                    <div className="text-sm opacity-80">Finished</div>
                  </div>

                  {/* In Progress */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <ClockIcon className="w-8 h-8 opacity-80" />
                      <div className="text-sm font-medium opacity-90">In Progress</div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{taskData.summary.inProgress}</div>
                    <div className="text-sm opacity-80">Active</div>
                  </div>

                  {/* Ongoing */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <ArrowPathIcon className="w-8 h-8 opacity-80" />
                      <div className="text-sm font-medium opacity-90">Ongoing</div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{taskData.summary.ongoing}</div>
                    <div className="text-sm opacity-80">In progress</div>
                  </div>

                  {/* To Do */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <StarIcon className="w-8 h-8 opacity-80" />
                      <div className="text-sm font-medium opacity-90">To Do</div>
                    </div>
                    <div className="text-4xl font-bold mb-1">{taskData.summary.toDo}</div>
                    <div className="text-sm opacity-80">Pending</div>
                  </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        IT Tasks
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {taskData.tasks.length} Total
                      </p>
                    </div>
                    {taskData.tasks.length > 3 && (
                      <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        + View All
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Task Name
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Assignee
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Start Date
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Deadline
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Date Completed
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskData.tasks.slice(0, 3).map((task, index) => {
                            const getStatusColor = (status: string) => {
                              const statusLower = status.toLowerCase();
                              if (statusLower === "completed") {
                                return "bg-green-100 text-green-700";
                              } else if (statusLower === "in progress") {
                                return "bg-blue-100 text-blue-700";
                              } else if (statusLower === "ongoing") {
                                return "bg-purple-100 text-purple-700";
                              } else if (statusLower === "to do") {
                                return "bg-orange-100 text-orange-700";
                              }
                              return "bg-gray-100 text-gray-700";
                            };

                            return (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                              >
                                <td className="py-3 px-2 text-gray-900 font-medium">
                                  {task.taskName || "N/A"}
                                </td>
                                <td className="py-3 px-2 text-gray-600">
                                  {task.assignee || "N/A"}
                                </td>
                                <td className="py-3 px-2 text-gray-600">
                                  {task.startDate || "N/A"}
                                </td>
                                <td className="py-3 px-2 text-gray-600">
                                  {task.deadline || "N/A"}
                                </td>
                                <td className="py-3 px-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      task.status
                                    )}`}
                                  >
                                    {task.status || "N/A"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-gray-600">
                                  {task.dateCompleted || "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {taskData.tasks.length > 3 && (
                    <div className="px-2 py-3 bg-gray-50/50 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Showing 3 of {taskData.tasks.length} results
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && activeTab === "itUpdate" && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-purple-100 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All IT Tickets
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete ticket history with search and filter
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, account, type, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {
                    actualTicketData.filter(
                      (ticket) =>
                        ticket.fullName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        ticket.account
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        ticket.troubleshootingType
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        ticket.status
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length
                  }{" "}
                  of {actualTicketData.length} tickets match your search
                </p>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Account
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actualTicketData
                      .filter(
                        (ticket) =>
                          ticket.fullName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.account
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.troubleshootingType
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.status
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((ticket, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-600">
                            {ticket.timestamp.split(",")[0]}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {ticket.fullName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {ticket.account}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {ticket.troubleshootingType.split(",")[0]}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ticket.status === "Resolved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {ticket.timeResolved || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {ticket.employeeRating || "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Total: {actualTicketData.length} tickets | Filtered:{" "}
                    {
                      actualTicketData.filter(
                        (ticket) =>
                          ticket.fullName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.account
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.troubleshootingType
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          ticket.status
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      ).length
                    }{" "}
                    tickets
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IT Task Modal */}
      {isTaskModalOpen && taskData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
              onClick={() => setIsTaskModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All IT Tasks
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete task list with search and filter
                  </p>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by task name, assignee, or status..."
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {
                    taskData.tasks.filter(
                      (task) =>
                        task.taskName.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                        task.assignee.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                        task.status.toLowerCase().includes(taskSearchTerm.toLowerCase())
                    ).length
                  }{" "}
                  of {taskData.tasks.length} tasks match your search
                </p>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Task Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Assignee
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Start Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Deadline
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Date Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskData.tasks
                      .filter(
                        (task) =>
                          task.taskName.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                          task.assignee.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                          task.status.toLowerCase().includes(taskSearchTerm.toLowerCase())
                      )
                      .map((task, index) => {
                        const getStatusColor = (status: string) => {
                          const statusLower = status.toLowerCase();
                          if (statusLower === "completed") {
                            return "bg-green-100 text-green-700";
                          } else if (statusLower === "in progress") {
                            return "bg-blue-100 text-blue-700";
                          } else if (statusLower === "ongoing") {
                            return "bg-purple-100 text-purple-700";
                          } else if (statusLower === "to do") {
                            return "bg-orange-100 text-orange-700";
                          }
                          return "bg-gray-100 text-gray-700";
                        };

                        return (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {task.taskName || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.assignee || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.startDate || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.deadline || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status || "N/A"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.dateCompleted || "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Total: {taskData.tasks.length} tasks | Filtered:{" "}
                    {
                      taskData.tasks.filter(
                        (task) =>
                          task.taskName.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                          task.assignee.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                          task.status.toLowerCase().includes(taskSearchTerm.toLowerCase())
                      ).length
                    }{" "}
                    tasks
                  </p>
                  <button
                    onClick={() => setIsTaskModalOpen(false)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
