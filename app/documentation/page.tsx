"use client";

import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import LoginForm from "../components/LoginForm";
import { isAuthenticated } from "../lib/auth";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function DocumentationPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">
                System Documentation
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
                  Data Privacy
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
