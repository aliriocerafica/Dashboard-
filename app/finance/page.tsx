"use client";

import { useState, useEffect } from "react";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("payroll");
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch payroll concerns data
  const fetchPayrollData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/get-payroll-concerns?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payroll concerns");
      }
      const result = await response.json();
      if (result.success) {
        setPayrollData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching payroll data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchPayrollData();
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchPayrollData(true);
  };

  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "resolved") {
      return "bg-green-100 text-green-800";
    } else if (lowerStatus === "pending") {
      return "bg-orange-100 text-orange-800";
    } else if (lowerStatus === "on process" || lowerStatus === "onprocess") {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Finance Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                Financial management and reporting
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1D2Du8AeSWHVMSsHfe6Yxu6WxbLXrLvuMWU-h83YOgQQ/edit?usp=sharing"
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
              View Original Sheet
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("payroll")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payroll"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payroll Concerns
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Invoices
              </button>
            </nav>
          </div>
        </div>

        {/* Payroll Concerns Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payroll concerns...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Error Loading Data
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : payrollData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Concerns */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {payrollData.summary.totalConcerns}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Total Concerns
                    </div>
                  </div>

                  {/* Resolved Concerns */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {payrollData.summary.resolvedConcerns}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Resolved Concerns
                    </div>
                  </div>

                  {/* Pending Concerns */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {payrollData.summary.pendingConcerns}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Pending
                    </div>
                  </div>

                  {/* On Process Concerns */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <ArrowPathIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {payrollData.summary.onProcessConcerns}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      On Process
                    </div>
                  </div>
                </div>

                {/* Concerns Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        All Payroll Concerns
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete list of all submitted concerns
                        {lastUpdated && (
                          <span className="ml-2 text-xs">
                            • Last updated: {lastUpdated.toLocaleTimeString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathRoundedSquareIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                      </button>
                      {payrollData.concerns.length > 5 && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                        >
                          <span className="text-lg">+</span>
                          View All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payroll Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type of Concern
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Resolved
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payrollData.concerns.length > 0 ? (
                          payrollData.concerns.slice(0, 5).map((concern: any) => (
                            <tr key={concern.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {concern.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {concern.payrollDate || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {concern.concernType || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                {concern.details || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {concern.status && concern.status.trim() !== "" ? (
                                  <span
                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                      concern.status
                                    )}`}
                                  >
                                    {concern.status}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {concern.dateResolved && concern.dateResolved.trim() !== "" ? concern.dateResolved : "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-8 text-center text-sm text-gray-500"
                              >
                                No concerns found
                              </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal for View All Concerns */}
                {isModalOpen && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                      <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-md transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                      ></div>

                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              All Payroll Concerns
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              Complete list of all submitted concerns with search and filter
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
                              placeholder="Search by email, concern type, status, or details..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {
                              payrollData.concerns.filter(
                                (concern: any) =>
                                  concern.email
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  concern.concernType
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  concern.status
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  concern.details
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  concern.payrollDate
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                              ).length
                            }{" "}
                            of {payrollData.concerns.length} concerns match your search
                          </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  ID
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Payroll Date
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Type of Concern
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Details
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Status
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Date Resolved
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {payrollData.concerns
                                .filter(
                                  (concern: any) =>
                                    concern.email
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.concernType
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.status
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.details
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.payrollDate
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase())
                                ).length > 0 ? (
                                payrollData.concerns
                                  .filter(
                                    (concern: any) =>
                                      concern.email
                                        ?.toLowerCase()
                                        .includes(searchTerm.toLowerCase()) ||
                                      concern.concernType
                                        ?.toLowerCase()
                                        .includes(searchTerm.toLowerCase()) ||
                                      concern.status
                                        ?.toLowerCase()
                                        .includes(searchTerm.toLowerCase()) ||
                                      concern.details
                                        ?.toLowerCase()
                                        .includes(searchTerm.toLowerCase()) ||
                                      concern.payrollDate
                                        ?.toLowerCase()
                                        .includes(searchTerm.toLowerCase())
                                  )
                                  .map((concern: any) => (
                                  <tr
                                    key={concern.id}
                                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                                  >
                                    <td className="py-3 px-4 text-gray-900 font-medium">
                                      {concern.id}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                      {concern.payrollDate || "N/A"}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                      {concern.concernType || "N/A"}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                                      {concern.details || "N/A"}
                                    </td>
                                    <td className="py-3 px-4">
                                      {concern.status && concern.status.trim() !== "" ? (
                                        <span
                                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                            concern.status
                                          )}`}
                                        >
                                          {concern.status}
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                          N/A
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                      {concern.dateResolved && concern.dateResolved.trim() !== "" ? concern.dateResolved : "N/A"}
                                    </td>
                                  </tr>
                                  ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="py-8 px-4 text-center text-sm text-gray-500"
                                  >
                                    No concerns found matching your search
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                              Total: {payrollData.concerns.length} concerns | Filtered:{" "}
                              {
                                payrollData.concerns.filter(
                                  (concern: any) =>
                                    concern.email
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.concernType
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.status
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.details
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase()) ||
                                    concern.payrollDate
                                      ?.toLowerCase()
                                      .includes(searchTerm.toLowerCase())
                                ).length
                              }{" "}
                              concerns
                            </p>
                            <button
                              onClick={() => setIsModalOpen(false)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-600">Invoices section coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
