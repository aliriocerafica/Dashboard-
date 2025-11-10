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
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/80 mb-1">Total Leads</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{stats.totalLeads}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Ready to Engage */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/80 mb-1">Ready to Engage</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{stats.readyToEngage}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </div>

      {/* In Development */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/80 mb-1">In Development</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{stats.developQualify}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Needs Review */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-105">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/80 mb-1">Needs Review</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{stats.unqualified}</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </div>
    </>
  );
}
