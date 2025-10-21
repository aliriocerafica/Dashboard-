import { DashboardStats } from "../lib/sheets";
import {
  UsersIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      {/* Total Leads */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UsersIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {stats.totalLeads}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Total leads
          </div>
        </div>
      </div>

      {/* Ready to Engage */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircleIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-emerald-600">
            {stats.readyToEngage}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Ready to engage
          </div>
        </div>
      </div>

      {/* In Development */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowTrendingUpIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-600">
            {stats.developQualify}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            In development
          </div>
        </div>
      </div>

      {/* Needs Review */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-600">
            {stats.unqualified}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Needs review
          </div>
        </div>
      </div>
    </>
  );
}
