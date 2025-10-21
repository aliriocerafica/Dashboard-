"use client";

import { useState, useEffect } from "react";
import LoginForm from "../../components/LoginForm";
import { isAuthenticated, setAuthenticated } from "../../lib/auth";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface Request {
  id: string;
  name: string;
  email: string;
  department: string;
  asset: string;
  reason: string;
  status: string;
  timestamp: string;
}

export default function AdminRequestsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  // Sample data - in a real app, this would fetch from your Google Sheet or database
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch requests from Google Sheets
      const fetchRequests = async () => {
        try {
          const response = await fetch("/api/get-it-requests");
          const data = await response.json();

          if (data.success) {
            setRequests(data.requests);
          } else {
            console.error("Failed to fetch requests:", data.message);
          }
        } catch (error) {
          console.error("Error fetching requests:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequests();
    }
  }, [isLoggedIn]);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setSendingEmail(true);
    setSelectedRequestId(requestId);
    setSelectedStatus(newStatus);

    try {
      const response = await fetch("/api/update-request-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          name: request.name,
          email: request.email,
          asset: request.asset,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setRequests(
          requests.map((r) =>
            r.id === requestId ? { ...r, status: newStatus } : r
          )
        );
        setEmailMessage(
          `Email sent to ${request.email} - Status updated to ${newStatus}`
        );
        setTimeout(() => setEmailMessage(""), 4000);
      } else {
        setEmailMessage(`Failed: ${data.message}`);
      }
    } catch (error) {
      setEmailMessage("Error sending email notification");
    } finally {
      setSendingEmail(false);
      setSelectedRequestId("");
      setSelectedStatus("");
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const statuses = ["Pending", "Approved", "Declined", "In Process"];
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Declined: "bg-red-100 text-red-800",
    "In Process": "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            IT Asset Requests Management
          </h1>
          <p className="text-gray-600">
            Review and manage all IT asset requests with email notifications
          </p>
        </div>

        {/* Email Message */}
        {emailMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <EnvelopeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Notification</h4>
              <p className="text-sm text-blue-700 mt-1">{emailMessage}</p>
            </div>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Request ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="animate-spin h-8 w-8 text-blue-600 mb-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <p className="text-gray-600">Loading requests...</p>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-600">
                        No IT asset requests found
                      </p>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 underline">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {request.asset}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[
                              request.status as keyof typeof statusColors
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {statuses
                            .filter((s) => s !== request.status)
                            .map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusUpdate(request.id, status)
                                }
                                disabled={
                                  sendingEmail &&
                                  selectedRequestId === request.id
                                }
                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                                  sendingEmail &&
                                  selectedRequestId === request.id
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                                }`}
                              >
                                {sendingEmail &&
                                selectedRequestId === request.id
                                  ? "..."
                                  : status}
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Update request status by clicking the status buttons</li>
            <li>
              • Automatic emails are sent to the requester with status updates
            </li>
            <li>• Status options: Pending, Approved, Declined, In Process</li>
            <li>• Email notifications include the request details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
