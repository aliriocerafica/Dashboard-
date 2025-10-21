// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  BuildingOffice2Icon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface DashboardData {
  summary: {
    totalCommitments?: number;
    completeCommitments?: number;
    incompleteCommitments?: number;
    commitmentRate?: string;
  };
  officeScores: Array<{
    office: string;
    score: string;
  }>;
  unitScores: Array<{
    unit: string;
    score: string;
    scoreValue: number;
  }>;
}

export default function PresidentPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheetUrl =
        "https://docs.google.com/spreadsheets/d/1qp_5G8qnw_T1AUYMW4zQhgTzSo5kfX8AczOEM6jO-xw/edit";
      const response = await fetch(
        `/api/get-president-dashboard?sheetUrl=${encodeURIComponent(
          sheetUrl
        )}&gid=1871520824`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (result.success) {
        console.log("Dashboard data loaded:", result.data);
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 70) return "text-emerald-600";
    if (scoreValue >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressBarColor = (scoreValue: number) => {
    if (scoreValue >= 70) return "bg-emerald-600";
    if (scoreValue >= 50) return "bg-amber-500";
    return "bg-red-600";
  };

  const getBadgeColor = (scoreValue: number) => {
    if (scoreValue >= 70) return "bg-emerald-100 text-emerald-700";
    if (scoreValue >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading President dashboard...</p>
        </div>
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
              onClick={fetchDashboardData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              Office of The President
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              WIG Session Tracker - Commitment Scores & Performance
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  loading ? "animate-spin" : ""
                }`}
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
                {loading ? "Refreshing..." : "Refresh Data"}
              </span>
              <span className="sm:hidden">
                {loading ? "Refresh..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* Row 1: KPI tiles (4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Total Commitments */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 sm:p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              <div className="text-xs sm:text-sm font-medium opacity-90">
                Total
              </div>
            </div>
            <div className="text-2xl sm:text-4xl font-bold mb-1">
              {dashboardData?.summary.totalCommitments || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-80">Commitments</div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Completed
              </div>
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
              {dashboardData?.summary.completeCommitments || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Finished</div>
          </div>

          {/* Incomplete */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <XCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Incomplete
              </div>
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
              {dashboardData?.summary.incompleteCommitments || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Pending</div>
          </div>

          {/* Commitment Rate */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Rate
              </div>
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
              {dashboardData?.summary.commitmentRate || "0%"}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Commitment</div>
          </div>
        </div>

        {/* Row 2: Office Scores + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Office Scores */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Commitment Score Per Office
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-80 overflow-y-auto pr-1">
                {dashboardData?.officeScores.map((item, index) => {
                  const scoreValue = parseFloat(item.score.replace("%", ""));
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs sm:text-sm text-gray-700 font-medium truncate flex-1 mr-2">
                        {item.office}
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getBadgeColor(
                          scoreValue
                        )}`}
                      >
                        {item.score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Total
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-gray-900">
                    {dashboardData?.summary.totalCommitments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Completed
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-emerald-600">
                    {dashboardData?.summary.completeCommitments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Incomplete
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-red-600">
                    {dashboardData?.summary.incompleteCommitments || 0}
                  </span>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-gray-200">
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-1">
                    Overall Rate
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {dashboardData?.summary.commitmentRate || "0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Unit Scores Table */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Commitment Score Per Unit
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                {dashboardData?.unitScores.length || 0} Units
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">
                    Unit
                  </th>
                  <th className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">
                    Progress
                  </th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-2 font-semibold text-gray-700">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.unitScores.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-900 font-medium text-xs sm:text-sm">
                      {item.unit}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <div className="w-20 sm:w-32 md:w-48 bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div
                            className={`h-1.5 sm:h-2 rounded-full ${getProgressBarColor(
                              item.scoreValue
                            )}`}
                            style={{
                              width: `${Math.min(item.scoreValue, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-right">
                      <span
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${getBadgeColor(
                          item.scoreValue
                        )}`}
                      >
                        {item.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
