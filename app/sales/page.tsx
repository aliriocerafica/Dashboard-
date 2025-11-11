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
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTDistJH55uEgQ6wKWhK48fHEg8_F9UwMjd4yp9FUgFuUvJwSBsdKrW9xOlDTiKW3B0LR-4vk-PiBp/pub?output=csv";

const VIEW_SHEET_URL =
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

      console.log("Fetching Sales data from:", GOOGLE_SHEET_URL);
      console.log("User Agent:", navigator.userAgent);
      console.log(
        "Is Mobile:",
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );

      const sheetData = await fetchSheetData(GOOGLE_SHEET_URL);
      console.log(
        "Sales data fetched successfully:",
        sheetData.length,
        "records"
      );

      setData(sheetData);
      setStats(calculateStats(sheetData));

      // Cache the data for 5 minutes
      cache.set(cacheKey, sheetData, 5 * 60 * 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      console.error("Error loading Sales data:", err);
      console.error("Error details:", {
        message: errorMessage,
        url: GOOGLE_SHEET_URL,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800">
                Data Loading Error
              </h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="bg-red-100 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">
                Troubleshooting Steps:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Ensure the Google Sheet is published to the web</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => loadData(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  window.location.href = "/home";
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Back to Home
              </button>
            </div>
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
                href={VIEW_SHEET_URL}
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

        {/* Row 1: Stats Cards - Total Leads | Ready to Engage | In Development | Needs Review */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <StatsCards stats={stats} />
            </div>

        {/* Row 2: Goal Progress & Weekly Growth Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 items-stretch">
          <ProgressStats data={data} />
          <SalesWeeklyTrend data={data} />
        </div>

        {/* Row 3: This Month | This Week | Lead Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <SummaryCards stats={stats} data={data} />
        </div>

        {/* Row 4: Lead Status | Lead Source | Touch Points | Lead Responses - All Inline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Charts data={data} stats={stats} />
          </div>

        {/* Sales Pipeline - Full Width Table */}
        <div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
