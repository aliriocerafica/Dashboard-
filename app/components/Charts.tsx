import { SalesData, DashboardStats } from "../lib/sheets";
import {
  TagIcon,
  DevicePhoneMobileIcon,
  HandRaisedIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface ChartsProps {
  data: SalesData[];
  stats: DashboardStats;
}

export default function Charts({ data, stats }: ChartsProps) {
  // Calculate fit level distribution
  const fitLevelDistribution = data.reduce((acc, item) => {
    if (item.fitLevel) {
      acc[item.fitLevel] = (acc[item.fitLevel] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate source distribution
  const sourceDistribution = data.reduce((acc, item) => {
    if (item.source) {
      acc[item.source] = (acc[item.source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate touch point distribution
  const touchPointDistribution = data.reduce((acc, item) => {
    if (item.touchPoint) {
      acc[item.touchPoint] = (acc[item.touchPoint] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate lead response distribution
  const leadResponseDistribution = data.reduce((acc, item) => {
    if (item.leadResponse) {
      acc[item.leadResponse] = (acc[item.leadResponse] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Lead Status */}
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <TagIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Lead Status</h3>
            <p className="text-xs text-gray-600">Distribution by fit level</p>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-60">
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Ready to Engage
              </span>
            </div>
            <span className="bg-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs">
              {fitLevelDistribution["Ready to Engage"] || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                In Development
              </span>
            </div>
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full font-bold text-xs">
              {fitLevelDistribution["Develop & Qualify"] || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Needs Review
              </span>
            </div>
            <span className="bg-amber-500 text-white px-2 py-1 rounded-full font-bold text-xs">
              {fitLevelDistribution["Unqualified"] || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Lead Sources</h3>
            <p className="text-xs text-gray-600">Where leads come from</p>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-60">
          {Object.entries(sourceDistribution).map(([source, count]) => (
            <div
              key={source}
              className="flex justify-between items-center p-2 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
            >
              <span className="text-sm font-medium text-gray-700 truncate">
                {source}
              </span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                {count}
              </span>
            </div>
          ))}
          {Object.keys(sourceDistribution).length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-400 text-xs">No data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Touch Points */}
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <HandRaisedIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Touch Point and SPF Status</h3>
            <p className="text-xs text-gray-600">Engagement methods</p>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-60">
          {Object.entries(touchPointDistribution).map(([touchPoint, count]) => (
            <div
              key={touchPoint}
              className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100"
            >
              <span className="text-sm font-medium text-gray-700">
                {touchPoint}
              </span>
              <span className="bg-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                {count}
              </span>
            </div>
          ))}
          {Object.keys(touchPointDistribution).length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-400 text-xs">No data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Responses */}
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Lead Responses</h3>
            <p className="text-xs text-gray-600">Response types</p>
          </div>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-60">
          {Object.entries(leadResponseDistribution).map(([response, count]) => (
            <div
              key={response}
              className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-100"
            >
              <span className="text-sm font-medium text-gray-700">
                {response}
              </span>
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                {count}
              </span>
            </div>
          ))}
          {Object.keys(leadResponseDistribution).length === 0 && (
            <div className="text-center py-4">
              <div className="text-gray-400 text-xs">No data available</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
