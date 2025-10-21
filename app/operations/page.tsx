// @ts-nocheck
"use client";

import { CogIcon } from "@heroicons/react/24/outline";

export default function OperationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
            <CogIcon className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Operations Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Process optimization and efficiency
          </p>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 p-12 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Data Available
              </h2>
              <p className="text-gray-400 mb-6">
                The Operations dashboard is currently under development. This
                will include:
              </p>
            </div>
            <ul className="text-left text-gray-300 space-y-2 mb-6">
              <li>• Process efficiency metrics</li>
              <li>• Resource utilization tracking</li>
              <li>• Quality control analytics</li>
              <li>• Supply chain monitoring</li>
              <li>• Performance optimization</li>
            </ul>
            <div className="text-center pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  window.location.href = "/home";
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
