import { SalesData } from "../lib/sheets";
import { useState } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface DataTableProps {
  data: SalesData[];
}

export default function DataTable({ data }: DataTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getScoreBadge = (score: number) => {
    if (score >= 20) return "bg-green-500 text-white";
    if (score >= 15) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getDaysInPipeline = (date: string) => {
    if (!date || date.trim() === "") return 0;
    const itemDate = new Date(date);
    if (isNaN(itemDate.getTime())) return 0;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - itemDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : diffDays;
  };

  const getDaysBadge = (days: number) => {
    if (days > 14) return "bg-red-500 text-white";
    if (days > 7) return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  // Filter data based on search term
  const filteredData = data.filter(
    (item) =>
      item.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fitLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show only first 3 rows in the main table
  const displayData = data.slice(0, 3);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Pipeline
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {data.length} Total
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              + View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => {
                const daysInPipeline = getDaysInPipeline(item.date);
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {item.firmName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.firmName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.contactPerson}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getScoreBadge(
                          item.score
                        )}`}
                      >
                        {item.score}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {daysInPipeline} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          item.fitLevel === "Ready to Engage"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.fitLevel === "Develop & Qualify"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.fitLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {item.source}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.length > 3 && (
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Showing 3 of {data.length} results
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Complete Sales Pipeline
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      All leads with search and filter capabilities
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company, contact, source, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {filteredData.length} of {data.length} leads match your search
                </p>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const daysInPipeline = getDaysInPipeline(item.date);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {item.firmName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {item.firmName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.date}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {item.contactPerson}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getScoreBadge(
                                item.score
                              )}`}
                            >
                              {item.score}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {daysInPipeline} days
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                item.fitLevel === "Ready to Engage"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : item.fitLevel === "Develop & Qualify"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.fitLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {item.source}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{data.length}</span> leads | Filtered: <span className="font-semibold">{filteredData.length}</span> leads
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
