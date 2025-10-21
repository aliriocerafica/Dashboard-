import { DashboardStats, SalesData } from '../lib/sheets';
import { CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SummaryCardsProps {
  stats: DashboardStats;
  data: SalesData[];
}

export default function SummaryCards({ stats, data }: SummaryCardsProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const currentWeek = getWeekNumber(currentDate);

  const monthlyData = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  const weeklyData = data.filter(item => {
    const itemDate = new Date(item.date);
    return getWeekNumber(itemDate) === currentWeek && itemDate.getFullYear() === currentYear;
  });

  const monthlyNew = monthlyData.length;
  const monthlyConverted = monthlyData.filter(item => item.fitLevel === 'Ready to Engage').length;
  const weeklyNew = weeklyData.length;
  const weeklyConverted = weeklyData.filter(item => item.fitLevel === 'Ready to Engage').length;
  const weeklyRate = weeklyNew > 0 ? Math.round((weeklyConverted / weeklyNew) * 100) : 0;

  // New: Count Cold/Warm/Hot leads for current week
  const weeklyCold = weeklyData.filter(item => item.leadStatus === 'Cold').length;
  const weeklyWarm = weeklyData.filter(item => item.leadStatus === 'Warm').length;
  const weeklyHot = weeklyData.filter(item => item.leadStatus === 'Hot').length;

  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Month Tile */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">This Month</div>
              <div className="text-xs text-gray-500">Performance</div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 rounded-md py-2 border border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{monthlyNew}</div>
            <div className="text-[10px] text-gray-600">New</div>
          </div>
          <div className="bg-blue-50 rounded-md py-2 border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{monthlyConverted}</div>
            <div className="text-[10px] text-gray-600">Converted</div>
          </div>
          <div className="bg-gray-50 rounded-md py-2 border border-gray-200">
            <div className="text-lg font-bold text-gray-700">{stats.totalLeads}</div>
            <div className="text-[10px] text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Week Tile */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ChartBarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">This Week</div>
            <div className="text-xs text-gray-500">Overview</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 rounded-md py-2 border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{weeklyNew}</div>
            <div className="text-[10px] text-gray-600">New</div>
          </div>
          <div className="bg-emerald-50 rounded-md py-2 border border-emerald-100">
            <div className="text-lg font-bold text-emerald-600">{weeklyConverted}</div>
            <div className="text-[10px] text-gray-600">Converted</div>
          </div>
          <div className="bg-amber-50 rounded-md py-2 border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{weeklyRate}%</div>
            <div className="text-[10px] text-gray-600">Rate</div>
          </div>
        </div>
      </div>

      {/* Lead Status Tile - Cold/Warm/Hot */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold">🔥</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Lead Status</div>
            <div className="text-xs text-gray-500">This Week</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 rounded-md py-2 border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{weeklyCold}</div>
            <div className="text-[10px] text-gray-600">Cold</div>
          </div>
          <div className="bg-amber-50 rounded-md py-2 border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{weeklyWarm}</div>
            <div className="text-[10px] text-gray-600">Warm</div>
          </div>
          <div className="bg-red-50 rounded-md py-2 border border-red-100">
            <div className="text-lg font-bold text-red-600">{weeklyHot}</div>
            <div className="text-[10px] text-gray-600">Hot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
