import { useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SummaryCard from "@/app/components/cards/SummaryCard";
import PayrollModal from "./PayrollModal";
import { useModal } from "@/app/hooks/useModal";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";
import { getStatusBadgeColor } from "@/app/lib/utils/statusUtils";

interface PayrollTabProps {
  payrollData: any;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export default function PayrollTab({
  payrollData,
  loading,
  error,
  isRefreshing,
  lastUpdated,
  onRefresh,
}: PayrollTabProps) {
  const modal = useModal();
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <LoadingSpinner size="lg" text="Loading payroll concerns..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!payrollData) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Concerns"
          value={payrollData.summary.totalConcerns}
          icon={<BanknotesIcon className="w-6 h-6 text-white" />}
          gradient="from-blue-500 to-blue-600"
        />
        <SummaryCard
          title="Resolved Concerns"
          value={payrollData.summary.resolvedConcerns}
          icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
          gradient="from-green-500 to-green-600"
        />
        <SummaryCard
          title="Pending"
          value={payrollData.summary.pendingConcerns}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          gradient="from-orange-500 to-orange-600"
        />
        <SummaryCard
          title="On Process"
          value={payrollData.summary.onProcessConcerns}
          icon={<ArrowPathIcon className="w-6 h-6 text-white" />}
          gradient="from-purple-500 to-purple-600"
        />
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
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathRoundedSquareIcon
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
            {payrollData.concerns.length > 5 && (
              <button
                onClick={modal.open}
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
                      {concern.dateResolved && concern.dateResolved.trim() !== ""
                        ? concern.dateResolved
                        : "N/A"}
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

      {/* Modal */}
      <PayrollModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        concerns={payrollData.concerns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}

