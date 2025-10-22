"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface MobileTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    mobileHidden?: boolean;
  }[];
  className?: string;
}

export default function MobileTable({
  data,
  columns,
  className = "",
}: MobileTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const visibleColumns = columns.filter((col) => !col.mobileHidden);
  const hiddenColumns = columns.filter((col) => col.mobileHidden);

  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((row, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          {/* Main row content */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleRow(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visibleColumns.slice(0, 2).map((column) => (
                    <div key={column.key} className="min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column.label}
                      </div>
                      <div className="text-sm text-gray-900 truncate">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ml-4 shrink-0">
                {hiddenColumns.length > 0 && (
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    {expandedRows.has(index) ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Expanded content */}
          {expandedRows.has(index) && hiddenColumns.length > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="space-y-3">
                {hiddenColumns.map((column) => (
                  <div key={column.key}>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {column.label}
                    </div>
                    <div className="text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
