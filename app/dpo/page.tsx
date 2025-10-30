"use client";

import { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { isAuthenticated, setAuthenticated } from "../lib/auth";
import {
  fetchDPOData,
  calculateDPOStats,
  DPOTask,
  DPODashboardStats,
} from "../lib/sheets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import StatsCards from "@/app/components/StatsCards";
import DPOCharts from "@/app/components/DPOCharts";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  LockClosedIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function DPOPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [dpoData, setDpoData] = useState<DPOTask[]>([]);
  const [stats, setStats] = useState<DPODashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    tasksByStatus: {},
    tasksByAssignee: {},
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // DPO WIG Google Sheets URL
  const DPO_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7SSTo_WAXSjYWE_stXl5LdVy2bBj1JOGwXiPWyBWKPaOBlqyafhGCr2brLc0Xsf7GMEP168sV0l03/pub?output=csv";

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setLoading(false);
  }, []);

  // Fetch DPO data when authenticated
  useEffect(() => {
    if (isLoggedIn) {
      fetchDPODataFromSheet();
    }
  }, [isLoggedIn]);

  const fetchDPODataFromSheet = async () => {
    try {
      setDataLoading(true);
      setError(null);

      console.log("🔄 Fetching DPO WIG data from Google Sheets...");
      const data = await fetchDPOData(DPO_SHEET_URL);
      console.log("📊 DPO Data fetched:", data);
      console.log(
        "📊 Raw task data:",
        data.map((task) => ({
          taskName: task.taskName,
          status: task.status,
          dateCompleted: task.dateCompleted,
        }))
      );

      setDpoData(data);

      // Calculate statistics
      const calculatedStats = calculateDPOStats(data);
      console.log("📈 DPO Stats calculated:", calculatedStats);
      console.log("📈 Status breakdown:", {
        totalTasks: calculatedStats.totalTasks,
        pendingTasks: calculatedStats.pendingTasks,
        completedTasks: calculatedStats.completedTasks,
        overdueTasks: calculatedStats.overdueTasks,
      });
      setStats(calculatedStats);
    } catch (error) {
      console.error("❌ Error fetching DPO data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch DPO data"
      );
    } finally {
      setDataLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    } else if (statusLower === "completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    } else if (statusLower === "overdue") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
    }
  };

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading || dataLoading) {
    return <LoadingSpinner />;
  }

  // Prepare data for DataTable
  const tableData = dpoData.map((task, index) => ({
    id: index + 1,
    taskName: task.taskName,
    startDate: task.startDate,
    status: task.status,
    submittedTo: task.submittedTo,
    targetDateOfCompletion: task.targetDateOfCompletion,
    dateCompleted: task.dateCompleted,
  }));

  const columns = [
    { key: "taskName", label: "Task Name" },
    { key: "startDate", label: "Start Date" },
    { key: "status", label: "Status" },
    { key: "submittedTo", label: "Submitted To" },
    { key: "targetDateOfCompletion", label: "Target Date" },
    { key: "dateCompleted", label: "Date Completed" },
  ];

  // Prepare chart data
  const statusChartData = Object.entries(stats.tasksByStatus).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  const assigneeChartData = Object.entries(stats.tasksByAssignee).map(
    ([assignee, count]) => ({
      name: assignee,
      value: count,
    })
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Data Protection Officer Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Monitor DPO WIG tasks, compliance activities, and privacy
                  initiatives
                </p>
              </div>
            </div>
            <button
              onClick={fetchDPODataFromSheet}
              disabled={dataLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`}
              />
              {dataLoading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">Error loading data</p>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchDPODataFromSheet}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                DPO WIG Tasks
              </button>
              <button
                onClick={() => setActiveTab("compliance")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "compliance"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Compliance Overview
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reports & Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "tasks" && (
          <>
            {/* Row 1: Key DPO Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Tasks */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
                  <div className="text-sm font-medium text-gray-600">
                    Total Tasks
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.totalTasks}
                </div>
                <div className="text-sm text-gray-500">WIG initiatives</div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <ClockIcon className="w-8 h-8 text-yellow-600" />
                  <div className="text-sm font-medium text-gray-600">
                    Pending Tasks
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.pendingTasks}
                </div>
                <div className="text-sm text-gray-500">In progress</div>
              </div>

              {/* Completed Tasks */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div className="text-sm font-medium text-gray-600">
                    Completed Tasks
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.completedTasks}
                </div>
                <div className="text-sm text-gray-500">Finished</div>
              </div>

              {/* Overdue Tasks */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                  <div className="text-sm font-medium text-gray-600">
                    Overdue Tasks
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.overdueTasks}
                </div>
                <div className="text-sm text-gray-500">Past deadline</div>
              </div>
            </div>

            {/* Row 2: Progress and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Completion Rate */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Completion Rate
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {stats.completionRate}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.completedTasks} of {stats.totalTasks} tasks completed
                  </p>
                </div>
              </div>

              {/* Average Completion Time */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Average Completion Time
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {stats.averageCompletionTime}
                  </div>
                  <div className="text-lg text-gray-600 mb-2">days</div>
                  <p className="text-sm text-gray-600">
                    Average time from start to completion
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Tasks by Status */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tasks by Status
                  </h3>
                </div>
                <DPOCharts data={statusChartData} type="pie" />
              </div>

              {/* Tasks by Assignee */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tasks by Assignee
                  </h3>
                </div>
                <DPOCharts data={assigneeChartData} type="bar" />
              </div>
            </div>

            {/* Row 4: Task Management */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    DPO WIG Task Management
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  View All Tasks
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 font-semibold text-lg">
                    {stats.totalTasks}
                  </div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-yellow-600 font-semibold text-lg">
                    {stats.pendingTasks}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 font-semibold text-lg">
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-600 font-semibold text-lg">
                    {stats.overdueTasks}
                  </div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Compliance Overview Tab */}
        {activeTab === "compliance" && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Overview
            </h3>
            <p className="text-gray-600">
              Compliance monitoring and privacy policy management will be
              available here.
            </p>
          </div>
        )}

        {/* Reports & Analytics Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reports & Analytics
            </h3>
            <p className="text-gray-600">
              Detailed reports and analytics will be available here.
            </p>
          </div>
        )}

        {/* Modal for View All Tasks */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-blue-100 rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      All DPO WIG Tasks
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete task history with search and filter
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
                      placeholder="Search by task name, status, or assignee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {
                      dpoData.filter(
                        (task) =>
                          task.taskName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          task.status
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          task.submittedTo
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      ).length
                    }{" "}
                    of {dpoData.length} tasks match your search
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
                          Start Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Submitted To
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Target Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Date Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpoData
                        .filter(
                          (task) =>
                            task.taskName
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.status
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.submittedTo
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((task, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-900 font-medium">
                              {task.taskName || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.startDate || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(task.status)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.submittedTo || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.targetDateOfCompletion || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {task.dateCompleted || "N/A"}
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
                      Total: {dpoData.length} tasks | Filtered:{" "}
                      {
                        dpoData.filter(
                          (task) =>
                            task.taskName
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.status
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            task.submittedTo
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        ).length
                      }{" "}
                      tasks
                    </p>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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
    </div>
  );
}
