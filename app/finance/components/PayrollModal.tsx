import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import BaseModal from "@/app/components/modals/BaseModal";
import { getStatusBadgeColor } from "@/app/lib/utils/statusUtils";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  concerns: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function PayrollModal({
  isOpen,
  onClose,
  concerns,
  searchTerm,
  onSearchChange,
}: PayrollModalProps) {
  const filteredConcerns = concerns.filter(
    (concern: any) =>
      concern.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.concernType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concern.payrollDate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Payroll Concerns"
      description="Complete list of all submitted concerns with search and filter"
      size="full"
    >
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, concern type, status, or details..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {filteredConcerns.length} of {concerns.length} concerns match your search
        </p>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Payroll Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Type of Concern
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Date Resolved
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredConcerns.length > 0 ? (
              filteredConcerns.map((concern: any) => (
                <tr
                  key={concern.id}
                  className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-900 font-medium">{concern.id}</td>
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
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">{concerns.length}</span> concerns |
          Filtered: <span className="font-semibold">{filteredConcerns.length}</span>
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
}

