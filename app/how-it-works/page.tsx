"use client";

import { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { isAuthenticated } from "../lib/auth";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function HowItWorksPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Handle ESC key to close image view
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageViewOpen) {
        setIsImageViewOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageViewOpen]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <InformationCircleIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">
                How It Works
              </h1>
              <p className="text-sm sm:text-base text-blue-100 mt-1">
                Business Intelligence Dashboard
              </p>
            </div>
          </div>
          <p className="text-base sm:text-lg text-blue-50">
            Comprehensive guide to using and understanding the dashboard system
          </p>
        </div>

        {/* How It Works Section - SVG at the top */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-6">
            <InformationCircleIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              System Workflow
            </h2>
          </div>
          <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
            Our dashboard system connects seamlessly with Google Sheets to provide
            real-time data visualization and analytics. Here's how the system works:
          </p>

          {/* SVG Image Container */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200 mb-8 overflow-hidden">
            <div 
              className="relative w-full aspect-video bg-gray-50 rounded-lg flex items-center justify-center p-4 cursor-pointer group hover:bg-gray-100 transition-all duration-300"
              onClick={() => setIsImageViewOpen(true)}
            >
              <img
                src="/HowITworks.svg"
                alt="How the Dashboard System Works"
                className="w-full h-full object-contain max-h-[600px] transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay with view icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg flex items-center justify-center transition-all duration-300">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <EyeIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              {/* Hint text */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                Click to view image
              </div>
            </div>
          </div>

          {/* Highlighted Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900">Data Source</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Google Sheets serve as the central data repository. Each department
                maintains their own sheets with real-time updates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900">API Integration</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Our system fetches data from published Google Sheets via CSV URLs,
                ensuring automatic synchronization without manual exports.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200 hover:border-green-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900">Data Processing</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Data is parsed, transformed, and processed to calculate metrics,
                statistics, and generate insights for each department.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900">Visualization</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Interactive charts, graphs, and tables display the processed data
                in an intuitive, easy-to-understand format.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-200 hover:border-red-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <h3 className="text-lg font-bold text-gray-900">Real-time Updates</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Users can refresh data on-demand to get the latest information
                from Google Sheets, ensuring always up-to-date dashboards.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <h3 className="text-lg font-bold text-gray-900">Secure Access</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Role-based authentication ensures that only authorized users can
                access department-specific dashboards and data.
              </p>
            </div>
          </div>
        </div>

        {/* Image View Modal - Simplified */}
        {isImageViewOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsImageViewOpen(false);
              }
            }}
          >
            <div className="flex min-h-screen items-center justify-center p-4">
              <div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      How It Works - System Workflow
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      View the complete system workflow diagram
                    </p>
                  </div>
                  <button
                    onClick={() => setIsImageViewOpen(false)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Image Container */}
                <div className="flex-1 overflow-auto bg-gray-100 p-8">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8">
                      <img
                        src="/HowITworks.svg"
                        alt="How the Dashboard System Works - Full View"
                        className="max-w-full h-auto select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Click outside or press ESC to close
                  </p>
                  <button
                    onClick={() => setIsImageViewOpen(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Developer Info */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ComputerDesktopIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Developed by IT Department
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Internal business intelligence solution
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            This dashboard system was developed and maintained by the IT
            Department to provide real-time insights into various business
            operations. The system integrates with Google Sheets to fetch and
            display live data across multiple departments.
          </p>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <InformationCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              How the System Works
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm text-blue-600 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Data Source
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  The system connects to Google Sheets as the primary data
                  source. Each department has its own dedicated spreadsheet
                  containing relevant data (leads, tickets, etc.).
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm text-blue-600 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Data Fetching
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  When you access a department dashboard, the system fetches the
                  latest data from the corresponding Google Sheet in CSV format.
                  This ensures you always see up-to-date information.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm text-blue-600 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Data Processing
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  The system parses and processes the CSV data, calculating
                  metrics like averages, totals, percentages, and trends. Weekly
                  reports are generated by filtering data based on date ranges.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm text-blue-600 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Visualization
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Data is displayed through interactive cards, charts, tables,
                  and progress bars. You can view weekly reports, search through
                  records, and track key performance indicators (KPIs).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <CheckCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Key Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Real-time Data
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Instant updates from Google Sheets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Weekly Reports
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Track performance by week with dropdown selector
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Search & Filter
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Find specific records with advanced search
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Multiple Departments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Sales, IT, Marketing, Finance, HR, Operations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  KPI Tracking
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Monitor key metrics and goals
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 rounded-lg">
              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Authentication
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Secure login system for authorized access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations and Disclaimers */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <ExclamationTriangleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              System Limitations & Disclaimers
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Data Accuracy
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  The system relies on the accuracy of data entered in Google
                  Sheets. Incorrect or incomplete data in the source spreadsheet
                  will result in inaccurate dashboard metrics. Please ensure
                  data is properly formatted and validated before entry.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Performance Considerations
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Large datasets (thousands of rows) may experience slower load
                  times. The system processes data client-side, so performance
                  depends on your device and browser capabilities. Consider
                  archiving old data periodically.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Network Dependency
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  The dashboard requires an active internet connection to fetch
                  data from Google Sheets. Slow or unstable connections may
                  cause delays or errors when loading data.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Google Sheets Permissions
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  The system requires that Google Sheets be published to the web
                  and accessible via CSV export. Changes to sheet permissions or
                  structure may break data connections.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Calculation Limitations
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Some metrics (like average resolution time and satisfaction
                  rates) rely on specific column structures and formulas in the
                  source sheet. Changing column positions or removing calculated
                  fields may cause metrics to display incorrectly.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Beta Software
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  This system is under continuous development. You may encounter
                  bugs, UI inconsistencies, or unexpected behavior. Please
                  report any issues to the IT Department for investigation and
                  resolution.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                  Data Protection
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  While the system uses authentication, sensitive data should be
                  handled with care. Do not share login credentials, and be
                  mindful of what information is displayed when sharing screens
                  or screenshots.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <ShieldCheckIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Best Practices
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Refresh Regularly:</strong> Use the "Refresh Data"
                button or reload the page to ensure you're viewing the most
                current data.
              </p>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Maintain Data Quality:</strong> Ensure source data in
                Google Sheets is accurate, complete, and follows the established
                format.
              </p>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Use Modern Browsers:</strong> For best performance, use
                the latest version of Chrome, Firefox, Edge, or Safari.
              </p>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Report Issues:</strong> If you encounter errors or
                unexpected behavior, contact the IT Department with details
                about what you were doing when the issue occurred.
              </p>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Logout When Done:</strong> Always logout when finished,
                especially on shared computers, to maintain security.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <ComputerDesktopIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-lg sm:text-2xl font-bold">Need Help?</h2>
          </div>
          <p className="text-purple-100 mb-3 text-sm sm:text-base">
            For technical support, feature requests, or to report bugs, please
            contact the IT Department.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />
              <span className="text-xs sm:text-sm">
                Support Hours: Mon-Fri 10 PM to 7 AM
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>© 2025 IT Department. Internal Use Only.</p>
          <p className="mt-1">
            Dashboard Version 1.0 - Last Updated: October 2025
          </p>
        </div>
      </div>
    </div>
  );
}

