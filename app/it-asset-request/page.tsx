"use client";

import ITAssetRequestForm from "../components/ITAssetRequestForm";

export default function ITAssetRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Form */}
        <ITAssetRequestForm />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Processing</h3>
            <p className="text-sm text-gray-600">
              Most requests are processed within 2-3 business days
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold text-gray-900 mb-2">Track Status</h3>
            <p className="text-sm text-gray-600">
              Use your Request ID to track the status of your request
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-2xl mb-2">📞</div>
            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              Contact IT Department if you have any questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
