"use client";

import { useState, useEffect } from "react";
import StatsCards from "../components/StatsCards";
import SummaryCards from "../components/SummaryCards";
import Charts from "../components/Charts";
import DataTable from "../components/DataTable";
import LoginForm from "../components/LoginForm";
import ProgressStats from "../components/ProgressStats";
import SalesWeeklyTrend from "../components/SalesWeeklyTrend";
import {
  fetchSheetData,
  calculateStats,
  SalesData,
  DashboardStats,
} from "../lib/sheets";
import { isAuthenticated, setAuthenticated } from "../lib/auth";
import { cache } from "../lib/cache";
import LoadingSpinner from "../components/LoadingSpinner";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1_sQb1x5vGjUtxTegjCLyDFi3MgfaG_hxu0x7rxXyArI/edit?gid=0#gid=0";

export default function SalesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    readyToEngage: 0,
    developQualify: 0,
    unqualified: 0,
    averageScore: 0,
    topSource: "",
  });
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `sales-data-${GOOGLE_SHEET_URL}`;
      const cachedData = cache.get<SalesData[]>(cacheKey);

      if (cachedData) {
        setData(cachedData);
        setStats(calculateStats(cachedData));
        setLoading(false);
        return;
      }

      const sheetData = await fetchSheetData(GOOGLE_SHEET_URL);
      setData(sheetData);
      setStats(calculateStats(sheetData));

      // Cache the data for 5 minutes
      cache.set(cacheKey, sheetData, 5 * 60 * 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

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
        <LoadingSpinner size="lg" text="Loading sales dashboard..." />
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
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
              Sales Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Track and manage your sales pipeline and leads
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
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
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatsCards stats={stats} />
          </div>
        </div>

        {/* Row 2: Progress Stats + Lead Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="lg:col-span-2">
            <ProgressStats data={data} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 h-full">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Lead Sources
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(
                  data.reduce((acc, item) => {
                    if (item.source)
                      acc[item.source] = (acc[item.source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count], i) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      {source}
                    </span>
                    <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Weekly Trend Chart + Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="lg:col-span-2">
            <SalesWeeklyTrend data={data} />
          </div>

          <div className="lg:col-span-1">
            <SummaryCards stats={stats} data={data} />
          </div>
        </div>

        {/* Row 5: Recent leads + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Leads
              </h3>
              <button className="text-blue-600 text-xs font-medium">
                SEE ALL
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {data.slice(0, 6).map((item, index) => {
                const colors = [
                  "bg-blue-600",
                  "bg-emerald-600",
                  "bg-purple-600",
                  "bg-orange-600",
                  "bg-rose-600",
                  "bg-indigo-600",
                ];
                const initials = item.contactPerson
                  ? item.contactPerson
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "N/A";
                return (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 ${
                        colors[index % colors.length]
                      } rounded-full flex items-center justify-center text-white text-xs font-semibold`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {item.firmName}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {item.fitLevel}
                      </div>
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
