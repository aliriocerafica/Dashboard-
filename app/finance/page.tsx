"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("payroll");
  const [payrollData, setPayrollData] = useState<any>(null);
  const [clientPaymentData, setClientPaymentData] = useState<any>(null);
  const [attendanceBonusData, setAttendanceBonusData] = useState<any>(null);
  const [qbData, setQbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [isFilteredModalOpen, setIsFilteredModalOpen] = useState(false);
  const [filteredPaymentStatus, setFilteredPaymentStatus] = useState<string>("");
  const [filteredClientName, setFilteredClientName] = useState<string>("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  
  // Passkey protection states
  const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(true);
  const [showPasskey, setShowPasskey] = useState(false);
  
  // Quarterly Bonus sub-navigation
  const [quarterlyBonusTab, setQuarterlyBonusTab] = useState("teamContinuity");
  
  // QB filters and search
  const [qbSearchTerm, setQbSearchTerm] = useState("");
  const [qbAccountFilter, setQbAccountFilter] = useState("All");
  const [qbStatusFilter, setQbStatusFilter] = useState("All");
  const [isQbModalOpen, setIsQbModalOpen] = useState(false);
  const [isTeamContinuityModalOpen, setIsTeamContinuityModalOpen] = useState(false);
  const [teamContinuitySearchTerm, setTeamContinuitySearchTerm] = useState("");

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

  // Fetch client payment data
  const fetchClientPaymentData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(`/api/get-client-payments?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client payment data");
      }
      const result = await response.json();
      if (result.success) {
        setClientPaymentData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching client payment data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch attendance bonus data
  const fetchAttendanceBonusData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(`/api/get-attendance-bonus?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attendance bonus data");
      }
      const result = await response.json();
      if (result.success) {
        setAttendanceBonusData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching attendance bonus data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch QB data
  const fetchQBData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await fetch(`/api/get-qb-data?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch QB data");
      }
      const result = await response.json();
      if (result.success) {
        setQbData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching QB data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Check if passkey is already verified in session OR if user is superadmin
  useEffect(() => {
    const currentUser = sessionStorage.getItem("username");
    const verified = sessionStorage.getItem("finance_passkey_verified");
    
    // Superadmin bypasses passkey requirement
    if (currentUser === "superadmin") {
      setIsPasskeyVerified(true);
      setIsCheckingPasskey(false);
      return;
    }
    
    if (verified === "true") {
      setIsPasskeyVerified(true);
    }
    setIsCheckingPasskey(false);

    // Listen for auth changes (logout)
    const handleAuthChange = () => {
      sessionStorage.removeItem("finance_passkey_verified");
      setIsPasskeyVerified(false);
      setPasskeyInput("");
      setPasskeyError("");
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // Initial fetch on mount - only if passkey is verified
  useEffect(() => {
    if (!isPasskeyVerified) return;
    
    if (activeTab === "payroll") {
      fetchPayrollData();
    } else if (activeTab === "clientPayments") {
      fetchClientPaymentData();
    } else if (activeTab === "attendanceBonus") {
      if (quarterlyBonusTab === "teamContinuity") {
        fetchAttendanceBonusData();
      } else if (quarterlyBonusTab === "qb") {
        fetchQBData();
      }
    }
  }, [activeTab, isPasskeyVerified, quarterlyBonusTab]);

  // Handle manual refresh
  const handleRefresh = () => {
    if (activeTab === "payroll") {
      fetchPayrollData(true);
    } else if (activeTab === "clientPayments") {
      fetchClientPaymentData(true);
    } else if (activeTab === "attendanceBonus") {
      if (quarterlyBonusTab === "teamContinuity") {
        fetchAttendanceBonusData(true);
      } else if (quarterlyBonusTab === "qb") {
        fetchQBData(true);
      }
    }
  };

  // Handle passkey submission
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError("");
    
    if (!passkeyInput.trim()) {
      setPasskeyError("Please enter the passkey");
      return;
    }

    try {
      const response = await fetch("/api/verify-finance-passkey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passkey: passkeyInput }),
      });

      const result = await response.json();

      if (result.success) {
        setIsPasskeyVerified(true);
        sessionStorage.setItem("finance_passkey_verified", "true");
        setPasskeyInput("");
        setPasskeyError("");
      } else {
        setPasskeyError("Invalid passkey. Please try again.");
        setPasskeyInput("");
      }
    } catch (err) {
      setPasskeyError("Error verifying passkey. Please try again.");
      console.error("Passkey verification error:", err);
    }
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

  // Show loading while checking passkey
  if (isCheckingPasskey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking access..." />
      </div>
    );
  }

  // Show passkey modal if not verified
  if (!isPasskeyVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Finance Dashboard
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Enter the passkey to access financial data
          </p>

          {/* Passkey Form */}
          <form onSubmit={handlePasskeySubmit} className="space-y-6">
            <div>
              <label
                htmlFor="passkey"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Numeric Passkey
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? "text" : "password"}
                  id="passkey"
                  value={passkeyInput}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setPasskeyInput(value);
                    setPasskeyError("");
                  }}
                  placeholder="Enter 6-digit passkey"
                  maxLength={6}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-bold transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  aria-label={showPasskey ? "Hide passkey" : "Show passkey"}
                >
                  {showPasskey ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passkeyError && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">{passkeyError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Verify & Access
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 This page is protected. Contact your administrator if you need
              access.
            </p>
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
                onClick={() => setActiveTab("clientPayments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "clientPayments"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Client Payment Update
              </button>
              <button
                onClick={() => setActiveTab("attendanceBonus")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "attendanceBonus"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Quarterly Bonus
              </button>
            </nav>
          </div>
        </div>

        {/* Payroll Concerns Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <LoadingSpinner size="lg" text="Loading payroll concerns..." />
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Client Payment Update Tab */}
        {activeTab === "clientPayments" && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <LoadingSpinner size="lg" text="Loading client payment data..." />
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
            ) : clientPaymentData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Total Clients */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {clientPaymentData.summary.totalClients}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Total Clients
                    </div>
                  </div>

                  {/* Paid Early */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {clientPaymentData.summary.paidEarly}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Paid Early
                    </div>
                  </div>

                  {/* Paid Late */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {clientPaymentData.summary.paidLate}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Paid Late
                    </div>
                  </div>

                  {/* Not Yet Paid */}
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <ArrowPathIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {clientPaymentData.summary.notYetPaid}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Not Yet Paid
                    </div>
                  </div>

                  {/* Total Payments */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {clientPaymentData.summary.totalPayments}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      Total Payments
                    </div>
                  </div>
                </div>

                {/* Payment Status Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment Status by Client
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Compare payment performance across all clients
                      </p>
                    </div>
                    <button
                      onClick={() => setIsChartModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      View Full Graph
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={(() => {
                          // Prepare chart data
                          return Object.keys(clientPaymentData.clientHistory).map((clientName) => {
                            const history = clientPaymentData.clientHistory[clientName];
                            const paidEarly = history.filter((p: any) => p.status === "Paid Early").length;
                            const paidOnTime = history.filter((p: any) => p.status === "Paid On Time").length;
                            const paidLate = history.filter((p: any) => p.status === "Paid Late").length;
                            
                            return {
                              client: clientName,
                              "Paid Early": paidEarly,
                              "Paid On Time": paidOnTime,
                              "Paid Late": paidLate,
                            };
                          }).sort((a, b) => {
                            // Sort by total payments descending
                            const totalA = a["Paid Early"] + a["Paid On Time"] + a["Paid Late"];
                            const totalB = b["Paid Early"] + b["Paid On Time"] + b["Paid Late"];
                            return totalB - totalA;
                          });
                        })()}
                        margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="client" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 11 }}
                          width={40}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          iconType="circle"
                          iconSize={10}
                        />
                        <Bar dataKey="Paid Early" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Paid On Time" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Paid Late" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Client History Cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Client Payment History
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        View payment patterns for each client
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
                      <a
                        href="https://docs.google.com/spreadsheets/d/1xx9jjQXmyBumS6SBbkjfNHpk2RRWuLNNJkuItYzgZL4/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Sheet
                      </a>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clients by name..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {Object.keys(clientPaymentData.clientHistory).filter((clientName) =>
                        clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
                      ).length}{" "}
                      of {Object.keys(clientPaymentData.clientHistory).length} clients match your search
                    </p>
                  </div>

                  {/* Client Cards Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.keys(clientPaymentData.clientHistory)
                        .filter((clientName) =>
                          clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
                        )
                        .map((clientName) => {
                        const history = clientPaymentData.clientHistory[clientName];
                        const latestPayment = history[history.length - 1];
                        
                        // Calculate client statistics
                        const totalInvoices = history.length;
                        const paidEarly = history.filter((p: any) => p.status === "Paid Early").length;
                        const paidLate = history.filter((p: any) => p.status === "Paid Late").length;
                        const notYetPaid = history.filter((p: any) => p.status === "Not Yet Paid").length;
                        
                        // Calculate class distribution from clientPaymentData.payments
                        const clientPayments = clientPaymentData.payments.filter((p: any) => p.clientName === clientName);
                        const classCounts: Record<string, number> = {};
                        clientPayments.forEach((p: any) => {
                          if (p.class) {
                            classCounts[p.class] = (classCounts[p.class] || 0) + 1;
                          }
                        });
                        
                        // Find the predominant class
                        let predominantClass = "";
                        let maxCount = 0;
                        Object.entries(classCounts).forEach(([className, count]) => {
                          if (count > maxCount) {
                            maxCount = count;
                            predominantClass = className;
                          }
                        });
                        
                        const classDisplay = predominantClass ? `Class ${predominantClass} (${maxCount})` : "No Class";
                        
                        return (
                          <div
                            key={clientName}
                            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-5">
                              <div>
                                <h4 className="font-bold text-gray-900 text-xl mb-1">{clientName}</h4>
                                <p className="text-xs text-gray-500">Payment Performance</p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                predominantClass === "A" 
                                  ? "bg-green-500 text-white" 
                                  : predominantClass === "B"
                                  ? "bg-blue-500 text-white"
                                  : predominantClass === "C"
                                  ? "bg-yellow-500 text-white"
                                  : predominantClass === "D"
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}>
                                {classDisplay}
                              </span>
                            </div>
                            
                            {/* Client Statistics */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              {/* Total Invoices - Clickable */}
                              <div 
                                className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilteredClientName(clientName);
                                  setFilteredPaymentStatus("All");
                                  setIsFilteredModalOpen(true);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                              </div>
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{totalInvoices}</div>
                                <div className="text-xs font-semibold text-indigo-700">Total Invoices</div>
                              </div>

                              {/* Paid Early - Clickable */}
                              <div 
                                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilteredClientName(clientName);
                                  setFilteredPaymentStatus("Paid Early");
                                  setIsFilteredModalOpen(true);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                              </div>
                                <div className="text-3xl font-bold text-green-600 mb-1">{paidEarly}</div>
                                <div className="text-xs font-semibold text-green-700">Paid Early</div>
                            </div>

                              {/* Paid Late - Clickable */}
                              <div 
                                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilteredClientName(clientName);
                                  setFilteredPaymentStatus("Paid Late");
                                  setIsFilteredModalOpen(true);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                        </div>
                                <div className="text-3xl font-bold text-orange-600 mb-1">{paidLate}</div>
                                <div className="text-xs font-semibold text-orange-700">Paid Late</div>
                                      </div>

                              {/* Not Yet Paid - Clickable */}
                              <div 
                                className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilteredClientName(clientName);
                                  setFilteredPaymentStatus("Not Yet Paid");
                                  setIsFilteredModalOpen(true);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                    </div>
                                <div className="text-3xl font-bold text-red-600 mb-1">{notYetPaid}</div>
                                <div className="text-xs font-semibold text-red-700">Not Yet Paid</div>
                                </div>
                              </div>
                            
                            {/* Latest Payment Info */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-200">
                              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Latest Payment</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Period:</span>
                                  <span className="text-sm font-bold text-gray-900">{latestPayment.coverageDate}</span>
                          </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Due Date:</span>
                                  <span className="text-sm font-bold text-gray-900">{latestPayment.dueDate || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600 font-medium">Payment Date:</span>
                                  <span className="text-sm font-bold text-gray-900">{latestPayment.paymentDate}</span>
                    </div>
                  </div>
                </div>

                    </div>
                        );
                      })}
                      
                      {/* No Results Message */}
                      {Object.keys(clientPaymentData.clientHistory)
                        .filter((clientName) =>
                          clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
                        ).length === 0 && (
                        <div className="col-span-2 text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                          <p className="text-gray-500">
                            No clients match your search term "{clientSearchTerm}"
                          </p>
                        </div>
                      )}
                  </div>
                  </div>
                </div>

                {/* Filtered Payments Modal */}
                {isFilteredModalOpen && clientPaymentData && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                      <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-md transition-opacity"
                        onClick={() => setIsFilteredModalOpen(false)}
                      ></div>

                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl ${
                          filteredPaymentStatus === "Paid Early" ? "bg-gradient-to-r from-green-50 to-green-100" :
                          filteredPaymentStatus === "Paid Late" ? "bg-gradient-to-r from-orange-50 to-orange-100" :
                          filteredPaymentStatus === "Not Yet Paid" ? "bg-gradient-to-r from-red-50 to-red-100" :
                          filteredPaymentStatus === "All" ? "bg-gradient-to-r from-indigo-50 to-indigo-100" :
                          "bg-gradient-to-r from-blue-50 to-blue-100"
                        }`}>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {filteredClientName} - {filteredPaymentStatus === "All" ? "All Invoices" : filteredPaymentStatus}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {filteredPaymentStatus === "All" ? "Complete payment history" : `All payments with status: ${filteredPaymentStatus}`}
                            </p>
                          </div>
                          <button
                            onClick={() => setIsFilteredModalOpen(false)}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                          </button>
                        </div>

                        {/* Info Section */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg ${
                                filteredPaymentStatus === "Paid Early" ? "bg-green-100" :
                                filteredPaymentStatus === "Paid Late" ? "bg-orange-100" :
                                filteredPaymentStatus === "Not Yet Paid" ? "bg-red-100" :
                                filteredPaymentStatus === "All" ? "bg-indigo-100" :
                                "bg-blue-100"
                              }`}>
                                <svg className={`w-6 h-6 ${
                                  filteredPaymentStatus === "Paid Early" ? "text-green-600" :
                                  filteredPaymentStatus === "Paid Late" ? "text-orange-600" :
                                  filteredPaymentStatus === "Not Yet Paid" ? "text-red-600" :
                                  filteredPaymentStatus === "All" ? "text-indigo-600" :
                                  "text-blue-600"
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                          </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  {filteredPaymentStatus === "All" ? "Showing all payments for" : `Showing ${filteredPaymentStatus} payments for`}
                                </p>
                                <p className="text-lg font-bold text-gray-900">{filteredClientName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-gray-900">
                                {filteredPaymentStatus === "All" 
                                  ? clientPaymentData.clientHistory[filteredClientName]?.length || 0
                                  : clientPaymentData.clientHistory[filteredClientName]?.filter(
                                      (p: any) => p.status === filteredPaymentStatus
                                    ).length || 0
                                }
                              </p>
                              <p className="text-sm text-gray-600">Total Records</p>
                            </div>
                          </div>
                        </div>

                        {/* Modal Body - Grid Layout */}
                        <div className="flex-1 overflow-auto p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(filteredPaymentStatus === "All" 
                              ? clientPaymentData.clientHistory[filteredClientName]
                              : clientPaymentData.clientHistory[filteredClientName]?.filter((payment: any) => payment.status === filteredPaymentStatus)
                            )?.map((payment: any, idx: number) => {
                              // Determine card color based on payment status
                              const cardColorClass = 
                                payment.status === "Paid Early" ? "from-green-50 to-green-100 border-green-200" :
                                payment.status === "Paid Late" ? "from-orange-50 to-orange-100 border-orange-200" :
                                payment.status === "Not Yet Paid" ? "from-red-50 to-red-100 border-red-200" :
                                "from-blue-50 to-blue-100 border-blue-200";
                              
                              const badgeColorClass =
                                payment.status === "Paid Early" ? "bg-green-500 text-white" :
                                payment.status === "Paid Late" ? "bg-orange-500 text-white" :
                                payment.status === "Not Yet Paid" ? "bg-red-500 text-white" :
                                "bg-blue-500 text-white";
                                
                              return (
                                <div
                                      key={idx}
                                  className={`bg-gradient-to-br rounded-xl p-5 border-2 shadow-md hover:shadow-xl transition-all duration-200 ${cardColorClass}`}
                                >
                                  {/* Coverage Date Header */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <p className="text-xs text-gray-600 font-medium">Coverage Period</p>
                                      <h4 className="text-lg font-bold text-gray-900">{payment.coverageDate}</h4>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${badgeColorClass}`}>
                                      {payment.status}
                                        </span>
                                  </div>

                                  {/* Payment Details Grid */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600 font-medium">Due Date</span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{payment.dueDate || "N/A"}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-600 font-medium">Payment Date</span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{payment.paymentDate || "Pending"}</span>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-600 font-medium">Days After Due</span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{payment.daysAfterDue || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }) || (
                                <div className="col-span-2 py-12 text-center">
                                  <div className="text-gray-400 text-6xl mb-4">📭</div>
                                  <p className="text-gray-600 font-medium">No payments found with this status</p>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <p className="text-sm font-bold text-gray-900">
                                {filteredPaymentStatus === "All" 
                                  ? `${clientPaymentData.clientHistory[filteredClientName]?.length || 0} Total Invoices`
                                  : `${clientPaymentData.clientHistory[filteredClientName]?.filter(
                                      (p: any) => p.status === filteredPaymentStatus
                                    ).length || 0} ${filteredPaymentStatus} Payments`
                                }
                              </p>
                              {filteredPaymentStatus !== "All" && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-sm text-gray-600">
                                    Total for {filteredClientName}: {clientPaymentData.clientHistory[filteredClientName]?.length || 0}
                                  </p>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => setIsFilteredModalOpen(false)}
                              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-white ${
                                filteredPaymentStatus === "Paid Early" ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" :
                                filteredPaymentStatus === "Paid Late" ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800" :
                                filteredPaymentStatus === "Not Yet Paid" ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" :
                                filteredPaymentStatus === "All" ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800" :
                                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              }`}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Modal */}
                {isChartModalOpen && clientPaymentData && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                      <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsChartModalOpen(false)}
                      />
                      
                      <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              Payment Status by Client - Full View
                            </h2>
                            <p className="text-sm text-blue-100 mt-1">
                              Detailed comparison of payment performance across all clients
                            </p>
                          </div>
                          <button
                            onClick={() => setIsChartModalOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-6 h-6 text-white" />
                          </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                          <ResponsiveContainer width="100%" height={600}>
                            <BarChart
                              data={(() => {
                                // Prepare chart data
                                return Object.keys(clientPaymentData.clientHistory).map((clientName) => {
                                  const history = clientPaymentData.clientHistory[clientName];
                                  const paidEarly = history.filter((p: any) => p.status === "Paid Early").length;
                                  const paidOnTime = history.filter((p: any) => p.status === "Paid On Time").length;
                                  const paidLate = history.filter((p: any) => p.status === "Paid Late").length;
                                  
                                  return {
                                    client: clientName,
                                    "Paid Early": paidEarly,
                                    "Paid On Time": paidOnTime,
                                    "Paid Late": paidLate,
                                  };
                                }).sort((a, b) => {
                                  // Sort by total payments descending
                                  const totalA = a["Paid Early"] + a["Paid On Time"] + a["Paid Late"];
                                  const totalB = b["Paid Early"] + b["Paid On Time"] + b["Paid Late"];
                                  return totalB - totalA;
                                });
                              })()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="client" 
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                tick={{ fontSize: 13 }}
                                stroke="#6b7280"
                              />
                              <YAxis 
                                stroke="#6b7280"
                                tick={{ fontSize: 13 }}
                                label={{ value: 'Number of Payments', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                  padding: '12px'
                                }}
                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '30px' }}
                                iconType="circle"
                                iconSize={12}
                              />
                              <Bar dataKey="Paid Early" fill="#10b981" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="Paid On Time" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="Paid Late" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium text-gray-700">Paid Early</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-medium text-gray-700">Paid On Time</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span className="text-sm font-medium text-gray-700">Paid Late</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsChartModalOpen(false)}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Quarterly Bonus Tab */}
        {activeTab === "attendanceBonus" && (
          <div className="space-y-6">
            {/* Sub-Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setQuarterlyBonusTab("teamContinuity")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    quarterlyBonusTab === "teamContinuity"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Team Continuity
                </button>
                <button
                  onClick={() => setQuarterlyBonusTab("qb")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    quarterlyBonusTab === "qb"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  QB
                </button>
              </div>
            </div>

            {/* Team Continuity Sub-Tab */}
            {quarterlyBonusTab === "teamContinuity" && (
              <>
                {loading ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <LoadingSpinner size="lg" text="Loading team continuity data..." />
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
            ) : attendanceBonusData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Total Teams */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {attendanceBonusData.summary.totalTeams}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      Total Teams
                    </div>
                  </div>

                  {/* With Bonus */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {attendanceBonusData.summary.withBonusCount}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      With Bonus
                    </div>
                  </div>

                  {/* Without Bonus */}
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <XMarkIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {attendanceBonusData.summary.withoutBonusCount}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      Without Bonus
                    </div>
                  </div>

                  {/* Total October */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {attendanceBonusData.totals.october}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      October Total
                    </div>
                  </div>

                  {/* Hired/Resigned October */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <ArrowPathIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {attendanceBonusData.hiredResigned.october}
                    </div>
                    <div className="text-xs font-medium text-white/90">
                      Net Change
                    </div>
                  </div>
                </div>

                {/* Team Performance Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Team Continuity Performance
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Employee count by team across months
                      </p>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathRoundedSquareIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={attendanceBonusData.teams}
                        margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="account" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Employee Count', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="august" fill="#3b82f6" radius={[8, 8, 0, 0]} name="August" />
                        <Bar dataKey="september" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="September" />
                        <Bar dataKey="october" fill="#10b981" radius={[8, 8, 0, 0]} name="October" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Teams Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Team Continuity Bonus Details
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete breakdown by team
                        {lastUpdated && (
                          <span className="ml-2 text-xs">
                            • Last updated: {lastUpdated.toLocaleTimeString()}
                          </span>
                        )}
                      </p>
                    </div>
                    {attendanceBonusData.teams.length > 10 && (
                      <button
                        onClick={() => setIsTeamContinuityModalOpen(true)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                      >
                        <span className="text-lg">+</span>
                        View All
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            August
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            September
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            October
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bonus Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceBonusData.teams.slice(0, 10).map((team: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {team.account.substring(0, 2)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-bold text-gray-900">{team.account}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-2xl font-bold text-blue-600">{team.august}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-2xl font-bold text-purple-600">{team.september}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-2xl font-bold text-green-600">{team.october}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {team.withBonus ? (
                                <span className="px-4 py-2 inline-flex items-center gap-2 text-sm leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                  <CheckCircleIcon className="w-5 h-5" />
                                  Yes
                                </span>
                              ) : (
                                <span className="px-4 py-2 inline-flex items-center gap-2 text-sm leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                  <XMarkIcon className="w-5 h-5" />
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-gradient-to-r from-gray-50 to-blue-50 font-bold border-t-2 border-gray-300">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            TOTAL
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-2xl font-bold text-blue-700">{attendanceBonusData.totals.august}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-2xl font-bold text-purple-700">{attendanceBonusData.totals.september}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-2xl font-bold text-green-700">{attendanceBonusData.totals.october}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-600">-</span>
                          </td>
                        </tr>
                        {/* Hired/Resigned Row */}
                        <tr className="bg-gradient-to-r from-gray-50 to-orange-50 font-semibold">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Hired/Resigned
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg text-gray-400">-</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-xl font-bold ${attendanceBonusData.hiredResigned.september >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {attendanceBonusData.hiredResigned.september > 0 ? '+' : ''}{attendanceBonusData.hiredResigned.september}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-xl font-bold ${attendanceBonusData.hiredResigned.october >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {attendanceBonusData.hiredResigned.october > 0 ? '+' : ''}{attendanceBonusData.hiredResigned.october}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-600">-</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Continuity Modal */}
                {isTeamContinuityModalOpen && (
                  <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                      <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-md transition-opacity"
                        onClick={() => setIsTeamContinuityModalOpen(false)}
                      ></div>

                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              All Teams - Continuity Bonus
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              Complete list of all teams with search
                            </p>
                          </div>
                          <button
                            onClick={() => setIsTeamContinuityModalOpen(false)}
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
                              placeholder="Search by account name..."
                              value={teamContinuitySearchTerm}
                              onChange={(e) => setTeamContinuitySearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {attendanceBonusData.teams.filter((team: any) =>
                              team.account.toLowerCase().includes(teamContinuitySearchTerm.toLowerCase())
                            ).length} of {attendanceBonusData.teams.length} teams match your search
                          </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                  Account
                                </th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                  August
                                </th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                  September
                                </th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                  October
                                </th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                  Bonus Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceBonusData.teams
                                .filter((team: any) =>
                                  team.account.toLowerCase().includes(teamContinuitySearchTerm.toLowerCase())
                                )
                                .map((team: any, index: number) => (
                                  <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                          <span className="text-white font-bold text-sm">
                                            {team.account.substring(0, 2)}
                                          </span>
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-bold text-gray-900">{team.account}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xl font-bold text-blue-600">{team.august}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xl font-bold text-purple-600">{team.september}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="text-xl font-bold text-green-600">{team.october}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {team.withBonus ? (
                                        <span className="px-3 py-1.5 inline-flex items-center gap-2 text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                          <CheckCircleIcon className="w-4 h-4" />
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1.5 inline-flex items-center gap-2 text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                          <XMarkIcon className="w-4 h-4" />
                                          No
                                        </span>
                                      )}
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
                              Total: {attendanceBonusData.teams.length} teams
                            </p>
                            <button
                              onClick={() => setIsTeamContinuityModalOpen(false)}
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
              </>
            )}

            {/* QB Sub-Tab */}
            {quarterlyBonusTab === "qb" && (
              <>
                {loading ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <LoadingSpinner size="lg" text="Loading QB data..." />
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
                ) : qbData ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                      {/* Total Employees */}
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {qbData.summary.totalEmployees}
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Total Employees
                        </div>
                      </div>

                      {/* Total Bonus Payout */}
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <BanknotesIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          ₱{(qbData.summary.totalBonusPayout / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Total Payout
                        </div>
                      </div>

                      {/* Avg Bonus */}
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          ₱{qbData.summary.avgBonusPerEmployee.toFixed(0)}
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Avg/Employee
                        </div>
                      </div>

                      {/* Regular */}
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {qbData.statusBreakdown.regular}
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Regular
                        </div>
                      </div>

                      {/* Probationary */}
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {qbData.statusBreakdown.probationary}
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Probationary
                        </div>
                      </div>

                      {/* Resigned */}
                      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <XMarkIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {qbData.statusBreakdown.resigned}
                        </div>
                        <div className="text-xs font-medium text-white/90">
                          Resigned
                        </div>
                      </div>
                    </div>

                    {/* Bonus Breakdown Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Bonus Breakdown by Account
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Total quarterly bonus distribution
                          </p>
                        </div>
                        <button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathRoundedSquareIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                      </div>
                      <div className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={qbData.accountSummary}
                            margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="account" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              tick={{ fontSize: 11 }}
                              stroke="#6b7280"
                            />
                            <YAxis 
                              stroke="#6b7280"
                              tick={{ fontSize: 11 }}
                              label={{ value: 'Total Bonus (₱)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              }}
                              formatter={(value: any) => `₱${value.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="totalAttendanceBonus" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Attendance" stackId="a" />
                            <Bar dataKey="totalClientSatisfaction" fill="#10b981" radius={[0, 0, 0, 0]} name="Client Satisfaction" stackId="a" />
                            <Bar dataKey="totalTeamContinuity" fill="#8b5cf6" radius={[0, 0, 0, 0]} name="Team Continuity" stackId="a" />
                            <Bar dataKey="totalSupervisorAward" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Supervisor Award" stackId="a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Employee Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Employee Quarterly Bonus Details
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Top 10 employees
                            {lastUpdated && (
                              <span className="ml-2 text-xs">
                                • Last updated: {lastUpdated.toLocaleTimeString()}
                              </span>
                            )}
                          </p>
                        </div>
                        {qbData.employees.length > 10 && (
                          <button
                            onClick={() => setIsQbModalOpen(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                          >
                            <span className="text-lg">+</span>
                            View All
                          </button>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Attendance
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client Sat.
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team Cont.
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supervisor
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                                Total Bonus
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {qbData.employees.slice(0, 10).map((emp: any) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white">
                                    <div className="font-medium text-gray-900">{emp.name}</div>
                                    <div className="text-xs text-gray-500">{emp.weeksPresent} weeks present</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {emp.account}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      emp.status === 'Regular' ? 'bg-green-100 text-green-800' :
                                      emp.status === 'Probationary' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {emp.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                                    ₱{emp.attendanceRelatedBonus.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                                    {emp.clientSatisfaction > 0 ? `₱${emp.clientSatisfaction.toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                                    {emp.teamContinuity > 0 ? `₱${emp.teamContinuity.toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                                    {emp.supervisorAward > 0 ? `₱${emp.supervisorAward.toFixed(2)}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right bg-blue-50">
                                    <span className="font-bold text-blue-900">
                                      ₱{emp.totalQuarterlyBonus.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* QB Employee Modal */}
                    {isQbModalOpen && (
                      <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center p-4">
                          <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-md transition-opacity"
                            onClick={() => setIsQbModalOpen(false)}
                          ></div>

                          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                  All Employees - Quarterly Bonus
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                  Complete list with search and filters
                                </p>
                              </div>
                              <button
                                onClick={() => setIsQbModalOpen(false)}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              >
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                              </button>
                            </div>

                            {/* Filters and Search */}
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={qbSearchTerm}
                                    onChange={(e) => setQbSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>

                                {/* Account Filter */}
                                <select
                                  value={qbAccountFilter}
                                  onChange={(e) => setQbAccountFilter(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                  <option value="All">All Accounts</option>
                                  {Array.from(new Set(qbData.employees.map((e: any) => e.account))).map((account: any) => (
                                    <option key={account} value={account}>{account}</option>
                                  ))}
                                </select>

                                {/* Status Filter */}
                                <select
                                  value={qbStatusFilter}
                                  onChange={(e) => setQbStatusFilter(e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                  <option value="All">All Status</option>
                                  <option value="Regular">Regular</option>
                                  <option value="Probationary">Probationary</option>
                                  <option value="Resigned">Resigned</option>
                                </select>
                              </div>
                              <p className="text-sm text-gray-500 mt-3">
                                {qbData.employees.filter((emp: any) => {
                                  const matchesSearch = emp.name.toLowerCase().includes(qbSearchTerm.toLowerCase());
                                  const matchesAccount = qbAccountFilter === "All" || emp.account === qbAccountFilter;
                                  const matchesStatus = qbStatusFilter === "All" || emp.status === qbStatusFilter;
                                  return matchesSearch && matchesAccount && matchesStatus;
                                }).length} of {qbData.employees.length} employees match your filters
                              </p>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                      Name
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                      Account
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                      Status
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                      Attendance
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                      Client Sat.
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                      Team Cont.
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                      Supervisor
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700 bg-blue-50">
                                      Total Bonus
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {qbData.employees
                                    .filter((emp: any) => {
                                      const matchesSearch = emp.name.toLowerCase().includes(qbSearchTerm.toLowerCase());
                                      const matchesAccount = qbAccountFilter === "All" || emp.account === qbAccountFilter;
                                      const matchesStatus = qbStatusFilter === "All" || emp.status === qbStatusFilter;
                                      return matchesSearch && matchesAccount && matchesStatus;
                                    })
                                    .map((emp: any) => (
                                      <tr key={emp.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap">
                                          <div className="font-medium text-gray-900">{emp.name}</div>
                                          <div className="text-xs text-gray-500">{emp.weeksPresent} weeks</div>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {emp.account}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            emp.status === 'Regular' ? 'bg-green-100 text-green-800' :
                                            emp.status === 'Probationary' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {emp.status}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-right text-gray-900">
                                          ₱{emp.attendanceRelatedBonus.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-right text-gray-900">
                                          {emp.clientSatisfaction > 0 ? `₱${emp.clientSatisfaction.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-right text-gray-900">
                                          {emp.teamContinuity > 0 ? `₱${emp.teamContinuity.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-right text-gray-900">
                                          {emp.supervisorAward > 0 ? `₱${emp.supervisorAward.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-right bg-blue-50">
                                          <span className="font-bold text-blue-900">
                                            ₱{emp.totalQuarterlyBonus.toFixed(2)}
                                          </span>
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
                                  Total: {qbData.employees.length} employees | 
                                  Filtered: {qbData.employees.filter((emp: any) => {
                                    const matchesSearch = emp.name.toLowerCase().includes(qbSearchTerm.toLowerCase());
                                    const matchesAccount = qbAccountFilter === "All" || emp.account === qbAccountFilter;
                                    const matchesStatus = qbStatusFilter === "All" || emp.status === qbStatusFilter;
                                    return matchesSearch && matchesAccount && matchesStatus;
                                  }).length}
                                </p>
                                <button
                                  onClick={() => setIsQbModalOpen(false)}
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
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
