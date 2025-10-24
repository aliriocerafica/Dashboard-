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
import AuthGuard from "../lib/auth-guard";

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

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `sales-data-${GOOGLE_SHEET_URL}`;

      // Only check cache if not forcing refresh
      if (!forceRefresh) {
        const cachedData = cache.get<SalesData[]>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setStats(calculateStats(cachedData));
          setLoading(false);
          return;
        }
      } else {
        // Clear cache when forcing refresh
        cache.delete(cacheKey);
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
              onClick={() => loadData(true)}
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Sales Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                Pipeline and leads management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <svg
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
                {loading ? "Loading..." : "Refresh"}
              </button>
              <a
                href={GOOGLE_SHEET_URL}
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Stats and Summary */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatsCards stats={stats} />
            </div>

            {/* Progress Stats */}
            <ProgressStats data={data} />

            {/* Weekly Trend */}
            <SalesWeeklyTrend data={data} />

            {/* Data Table */}
            <DataTable data={data} />
          </div>

          {/* Right Column - Summary and Charts */}
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <SummaryCards stats={stats} data={data} />

            {/* Charts */}
            <Charts data={data} stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
