"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MegaphoneIcon, ArrowPathIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/LoadingSpinner";

interface Lead {
  leadNumber: string;
  leadStatement: string;
  status: string;
  activities: Array<{
    activity: string;
    notes: string;
    status: string;
  }>;
}

interface MarketingData {
  leads: Lead[];
  summary: {
    totalLeads: number;
    totalActivities: number;
    leadsByStatus: Record<string, number>;
    statusCounts: Record<string, number>;
  };
}

interface GanttItem {
  name: string;
  isSubtask: boolean;
  notes?: string;
  start?: string;
  end?: string;
  duration?: string;
  status?: string;
  months: Record<string, string>;
}

interface GanttData {
  items: GanttItem[];
  headers: string[];
  statusCounts: Record<string, number>;
}

const COLORS = {
  "Pending Review": "#94a3b8",
  "Drafting": "#f59e0b",
  "In progress": "#3b82f6",
  "Completed": "#10b981",
  "Approved": "#8b5cf6",
  "Unknown": "#6b7280",
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketingData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [loadingGantt, setLoadingGantt] = useState(false);
  const [errorGantt, setErrorGantt] = useState<string | null>(null);
  const [ganttData, setGanttData] = useState<GanttData | null>(null);
  const [lastUpdatedGantt, setLastUpdatedGantt] = useState<string | null>(null);

  // Modal and search states
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false);
  const [leadsSearchTerm, setLeadsSearchTerm] = useState("");
  const [ganttSearchTerm, setGanttSearchTerm] = useState("");

  const MARKETING_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmD1pwH70Jmk99umPEi-XNJrvAxCiIOb-3S40eFHmHxT8-YKQ_I2hWbIwsQ4909AAMTByWZcr7jhTj/pub?gid=1083366093&single=true&output=csv";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/get-marketing-wig-tracker?timestamp=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result.data);
      setLastUpdated(result.lastUpdated || new Date().toISOString());
    } catch (err: any) {
      console.error("Error fetching marketing data:", err);
      setError(err.message || "Failed to fetch marketing data");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data on mount based on active tab
  useEffect(() => {
    if (activeTab === "dashboard" && !data) {
      fetchData();
    } else if (activeTab === "gantt" && !ganttData) {
      fetchGantt();
    }
  }, [activeTab]);

  const handleRefresh = () => {
    if (activeTab === "dashboard") {
      fetchData();
    } else {
      fetchGantt();
    }
  };

  const fetchGantt = async () => {
    try {
      setLoadingGantt(true);
      setErrorGantt(null);
      const res = await fetch(`/api/get-marketing-gantt?timestamp=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch Gantt: ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch Gantt");
      setGanttData(json.data);
      setLastUpdatedGantt(json.lastUpdated || new Date().toISOString());
    } catch (e: any) {
      setErrorGantt(e.message || "Failed to fetch Gantt");
    } finally {
      setLoadingGantt(false);
    }
  };

  // Prepare chart data
  const statusChartData =
    data?.summary.statusCounts
      ? Object.entries(data.summary.statusCounts).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  const leadsByStatusChartData =
    data?.summary.leadsByStatus
      ? Object.entries(data.summary.leadsByStatus).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Marketing Dashboard
          </h1>
              <p className="text-sm sm:text-base text-gray-900">
                {activeTab === "dashboard" ? (
                  <>
                    WIG Tracking and Scorecard
                    {lastUpdated && (
                      <span className="ml-2 text-gray-600">• Last updated: {new Date(lastUpdated).toLocaleString()}</span>
                    )}
                  </>
                ) : (
                  <>
                    Updated Gantt Chart
                    {lastUpdatedGantt && (
                      <span className="ml-2 text-gray-600">• Last updated: {new Date(lastUpdatedGantt).toLocaleString()}</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                onClick={handleRefresh}
                disabled={activeTab === "dashboard" ? loading : loadingGantt}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${activeTab === "dashboard" ? (loading ? "animate-spin" : "") : (loadingGantt ? "animate-spin" : "")}`}
                />
                {(activeTab === "dashboard" ? loading : loadingGantt) ? "Refreshing..." : "Refresh Data"}
                </button>
                <a
                href={
                  activeTab === "dashboard"
                    ? "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmD1pwH70Jmk99umPEi-XNJrvAxCiIOb-3S40eFHmHxT8-YKQ_I2hWbIwsQ4909AAMTByWZcr7jhTj/edit#gid=1083366093"
                    : "https://docs.google.com/spreadsheets/d/e/2PACX-1vRmD1pwH70Jmk99umPEi-XNJrvAxCiIOb-3S40eFHmHxT8-YKQ_I2hWbIwsQ4909AAMTByWZcr7jhTj/edit#gid=240728240"
                }
                  target="_blank"
                  rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
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
                View Sheet
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("gantt")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "gantt"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Updated Gantt Chart
              </button>
            </nav>
          </div>
        </div>

        {/* Loading / Error (Dashboard) */}
        {activeTab === "dashboard" && loading && !data && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <LoadingSpinner size="lg" text="Loading marketing data..." />
          </div>
        )}

        {activeTab === "dashboard" && error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-red-600 text-5xl mb-3">⚠️</div>
            <p className="font-semibold text-gray-900 mb-1">
              Failed to load data
            </p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {activeTab === "dashboard" && !loading && !error && data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
                <div className="text-sm font-medium text-white/90 mb-2">Total Leads</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {data.summary.totalLeads}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
                <div className="text-sm font-medium text-white/90 mb-2">Total Activities</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {data.summary.totalActivities}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
                <div className="text-sm font-medium text-white/90 mb-2">Completed Leads</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {data.summary.leadsByStatus["Completed"] || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 shadow-lg text-white">
                <div className="text-sm font-medium text-white/90 mb-2">In Progress</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {data.summary.leadsByStatus["Drafting"] || 0}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Chart */}
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Status Distribution
                </h3>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[entry.name as keyof typeof COLORS] ||
                              COLORS.Unknown
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No status data available
                  </div>
                )}
              </div>

              {/* Leads by Status Chart */}
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Leads by Status
                </h3>
                {leadsByStatusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leadsByStatusChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No leads data available
                  </div>
                )}
              </div>
            </div>

            {/* Leads List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      WIG Leads
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {data.leads.length} Total
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLeadsModalOpen(true)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    + View All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Statement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Activities
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leads.slice(0, 3).map((lead, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            {lead.leadNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium max-w-md">
                            {lead.leadStatement}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                              lead.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : lead.status === "Drafting"
                                ? "bg-orange-100 text-orange-800"
                                : lead.status === "Approved"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {lead.activities.length} activities
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.leads.length > 3 && (
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Showing 3 of {data.leads.length} results
                  </p>
                </div>
              )}
            </div>

            {/* Status Counts Summary */}
            {Object.keys(data.summary.statusCounts).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {Object.entries(data.summary.statusCounts).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl font-bold text-gray-900">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {status}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State - No Data (Dashboard) */}
        {activeTab === "dashboard" && !loading && !error && !data && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-6">
              Click "Refresh Data" to load marketing data from the Google Sheet.
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              Refresh Data
            </button>
          </div>
        )}

        {/* Leads Modal */}
        {isLeadsModalOpen && data && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                onClick={() => setIsLeadsModalOpen(false)}
              ></div>

              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-slate-50 to-gray-50 rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      All WIG Leads
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete list of all leads with activities and search capabilities
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLeadsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                      placeholder="Search by lead number, statement, or status..."
                      value={leadsSearchTerm}
                      onChange={(e) => setLeadsSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {data.leads.filter(
                      (lead) =>
                        lead.leadNumber.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                        lead.leadStatement.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                        lead.status.toLowerCase().includes(leadsSearchTerm.toLowerCase())
                    ).length}{" "}
                    of {data.leads.length} leads match your search
                  </p>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto">
                  <div className="divide-y divide-gray-200">
                    {data.leads
                      .filter(
                        (lead) =>
                          lead.leadNumber.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                          lead.leadStatement.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                          lead.status.toLowerCase().includes(leadsSearchTerm.toLowerCase())
                      )
                      .map((lead, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                  {lead.leadNumber}
                                </span>
                                <span
                                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                                    lead.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : lead.status === "Drafting"
                                      ? "bg-orange-100 text-orange-800"
                                      : lead.status === "Approved"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {lead.status}
                                </span>
                              </div>
                              <p className="text-gray-900 font-medium">
                                {lead.leadStatement}
                              </p>
                            </div>
                          </div>

                          {/* Activities */}
                          {lead.activities.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Activities ({lead.activities.length}):
                              </h4>
                              <div className="space-y-2">
                                {lead.activities.map((activity, actIndex) => (
                                  <div
                                    key={actIndex}
                                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                          {activity.activity}
                                        </p>
                                        {activity.notes && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            {activity.notes}
                                          </p>
                                        )}
                                      </div>
                                      {activity.status && (
                                        <span
                                          className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                                            activity.status === "Completed"
                                              ? "bg-green-100 text-green-800"
                                              : activity.status === "Drafting"
                                              ? "bg-orange-100 text-orange-800"
                                              : activity.status === "In progress"
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {activity.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total: {data.leads.length} leads | Filtered:{" "}
                      {data.leads.filter(
                        (lead) =>
                          lead.leadNumber.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                          lead.leadStatement.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
                          lead.status.toLowerCase().includes(leadsSearchTerm.toLowerCase())
                      ).length}{" "}
                      leads
                    </p>
                    <button
                      onClick={() => setIsLeadsModalOpen(false)}
                      className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gantt Tab */}
        {activeTab === "gantt" && (
          <div className="space-y-6">
            {loadingGantt && !ganttData && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <LoadingSpinner size="lg" text="Loading Gantt data..." />
              </div>
            )}
            {errorGantt && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-red-600 text-5xl mb-3">⚠️</div>
                <p className="font-semibold text-gray-900 mb-1">Failed to load Gantt data</p>
                <p className="text-gray-600 mb-4">{errorGantt}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loadingGantt && !errorGantt && ganttData && (
              <>
                {/* Status Summary Cards */}
                {Object.keys(ganttData.statusCounts || {}).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
                    {Object.entries(ganttData.statusCounts).map(([label, count]) => {
                      // Determine color based on status label
                      const getStatusColor = (status: string) => {
                        const statusLower = status.toLowerCase();
                        if (statusLower === "completed") {
                          return "bg-gradient-to-br from-green-500 to-green-600";
                        } else if (statusLower === "ongoing" || statusLower === "on-going") {
                          return "bg-gradient-to-br from-blue-500 to-blue-600";
                        } else if (statusLower === "on hold" || statusLower === "on-hold") {
                          return "bg-gradient-to-br from-yellow-500 to-amber-600";
                        } else if (statusLower === "delayed") {
                          return "bg-gradient-to-br from-red-500 to-red-600";
                        } else if (statusLower === "target") {
                          return "bg-gradient-to-br from-purple-500 to-indigo-600";
                        } else {
                          return "bg-gradient-to-br from-gray-500 to-gray-600";
                        }
                      };

                      return (
                        <div
                          key={label}
                          className={`${getStatusColor(label)} rounded-xl p-6 shadow-lg text-white text-center`}
                        >
                          <div className="text-2xl font-bold text-white">{count}</div>
                          <div className="text-sm font-medium text-white/90 mt-1">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Updated Gantt Items
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ganttData.items.length} Total
                        </p>
                      </div>
                      <button
                        onClick={() => setIsGanttModalOpen(true)}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        + View All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Start
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            End
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ganttData.items.slice(0, 3).map((it, idx) => {
                          const badgeClass =
                            it.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : it.status?.toLowerCase() === "ongoing" || it.status?.toLowerCase() === "on-going"
                              ? "bg-blue-100 text-blue-800"
                              : it.status?.toLowerCase() === "on hold" || it.status?.toLowerCase() === "on-hold"
                              ? "bg-yellow-100 text-yellow-800"
                              : it.status?.toLowerCase() === "delayed"
                              ? "bg-red-100 text-red-800"
                              : it.status?.toLowerCase() === "target"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800";

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className={`text-sm text-gray-900 ${it.isSubtask ? "pl-4" : "font-medium"}`}>
                                  {it.name}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {it.status ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeClass}`}
                                  >
                                    {it.status}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.start || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.end || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.duration || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {ganttData.items.length > 3 && (
                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Showing 3 of {ganttData.items.length} results
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!loadingGantt && !errorGantt && !ganttData && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Gantt Data</h2>
                <p className="text-gray-600 mb-6">Click "Refresh Data" to load the updated Gantt chart from the Google Sheet.</p>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gantt Modal */}
        {isGanttModalOpen && ganttData && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                onClick={() => setIsGanttModalOpen(false)}
              ></div>

              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-slate-50 to-gray-50 rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      All Gantt Items
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete list of all Gantt items with search and filter capabilities
                    </p>
                  </div>
                  <button
                    onClick={() => setIsGanttModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                      placeholder="Search by activity name, status, start, or end date..."
                      value={ganttSearchTerm}
                      onChange={(e) => setGanttSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {ganttData.items.filter(
                      (it) =>
                        it.name.toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                        (it.status || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                        (it.start || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                        (it.end || "").toLowerCase().includes(ganttSearchTerm.toLowerCase())
                    ).length}{" "}
                    of {ganttData.items.length} items match your search
                  </p>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          Start
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          End
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ganttData.items
                        .filter(
                          (it) =>
                            it.name.toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                            (it.status || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                            (it.start || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                            (it.end || "").toLowerCase().includes(ganttSearchTerm.toLowerCase())
                        )
                        .map((it, idx) => {
                          const badgeClass =
                            it.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : it.status?.toLowerCase() === "ongoing" || it.status?.toLowerCase() === "on-going"
                              ? "bg-blue-100 text-blue-800"
                              : it.status?.toLowerCase() === "on hold" || it.status?.toLowerCase() === "on-hold"
                              ? "bg-yellow-100 text-yellow-800"
                              : it.status?.toLowerCase() === "delayed"
                              ? "bg-red-100 text-red-800"
                              : it.status?.toLowerCase() === "target"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800";

                          return (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className={`text-sm text-gray-900 ${it.isSubtask ? "pl-4" : "font-medium"}`}>
                                  {it.name}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {it.status ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeClass}`}
                                  >
                                    {it.status}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.start || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.end || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {it.duration || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                                <div className="line-clamp-2" title={it.notes || ""}>
                                  {it.notes || "—"}
                                </div>
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
                      Total: {ganttData.items.length} items | Filtered:{" "}
                      {ganttData.items.filter(
                        (it) =>
                          it.name.toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                          (it.status || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                          (it.start || "").toLowerCase().includes(ganttSearchTerm.toLowerCase()) ||
                          (it.end || "").toLowerCase().includes(ganttSearchTerm.toLowerCase())
                      ).length}{" "}
                      items
                    </p>
                    <button
                      onClick={() => setIsGanttModalOpen(false)}
                      className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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
