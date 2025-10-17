'use client';

import { SalesData } from '../lib/sheets';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface WeeklyTrendChartProps {
  data: SalesData[];
}

interface WeekData {
  week: string;
  weekNumber: number;
  readyToEngage: number;
  inDevelopment: number;
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  // Get week number from date
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  // Group data by week
  const weeklyData = data.reduce((acc, item) => {
    try {
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return acc;
      
      const weekNum = getWeekNumber(itemDate);
      const weekKey = `Week ${weekNum}`;
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekKey,
          weekNumber: weekNum,
          readyToEngage: 0,
          inDevelopment: 0,
        };
      }
      
      if (item.fitLevel === 'Ready to Engage') acc[weekKey].readyToEngage++;
      if (item.fitLevel === 'Develop & Qualify') acc[weekKey].inDevelopment++;
      
      return acc;
    } catch {
      return acc;
    }
  }, {} as Record<string, WeekData>);

  // Convert to array and sort by week number
  const weeks = Object.values(weeklyData)
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .slice(-8); // Show last 8 weeks

  // Find max value for scaling
  const allValues = weeks.flatMap(w => [w.readyToEngage, w.inDevelopment]);
  const maxValue = Math.max(...allValues, 1);
  
  // Calculate percentage improvement
  const firstWeek = weeks[0];
  const lastWeek = weeks[weeks.length - 1];
  const improvement = firstWeek && lastWeek && firstWeek.readyToEngage > 0
    ? (((lastWeek.readyToEngage - firstWeek.readyToEngage) / firstWeek.readyToEngage) * 100).toFixed(0)
    : '0';

  const hasData = weeks.length > 0 && maxValue > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Growth Projection</h3>
            <p className="text-xs text-gray-500">Pipeline trends over time</p>
          </div>
        </div>
        {hasData && parseInt(improvement) > 0 && (
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{improvement}%</div>
            <div className="text-xs text-gray-500">Growth Rate</div>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ChartBarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Weekly Data Available</h3>
          <p className="text-sm text-gray-600 max-w-md mb-4">
            Add leads with dates to your Google Sheet to see weekly trends.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-xs text-gray-700 max-w-md">
            <div className="font-semibold text-blue-900 mb-2">Required data in Google Sheet:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Column A: Date (e.g., 10/15/2024)</li>
              <li>Column L: Fit Level (Ready to Engage / Develop & Qualify)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Line Chart */}
      {hasData && (
        <div className="relative" style={{ height: '320px' }}>
          {/* Y-axis grid and labels */}
          <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-500 font-medium">
            {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((val, i) => (
              <div key={i} className="text-right pr-2">{val}</div>
            ))}
          </div>

          {/* Horizontal grid lines */}
          <div className="absolute left-12 right-0 top-0 bottom-12 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100"></div>
            ))}
          </div>

          {/* Chart area */}
          <svg className="absolute left-12 right-0 top-0 bottom-12 w-full h-full" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            {/* Ready to Engage Line (Dark Navy) */}
            <polyline
              points={weeks.map((week, i) => {
                const x = (i / (weeks.length - 1)) * 100;
                const y = 100 - ((week.readyToEngage / maxValue) * 100);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* In Development Line (Light Blue) */}
            <polyline
              points={weeks.map((week, i) => {
                const x = (i / (weeks.length - 1)) * 100;
                const y = 100 - ((week.inDevelopment / maxValue) * 100);
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,5"
            />

            {/* Data points - Ready to Engage */}
            {weeks.map((week, i) => {
              const x = (i / (weeks.length - 1)) * 100;
              const y = 100 - ((week.readyToEngage / maxValue) * 100);
              return (
                <g key={`ready-${i}`}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="5"
                    fill="#1e293b"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Highlight last point */}
                  {i === weeks.length - 1 && (
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="8"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Data points - In Development */}
            {weeks.map((week, i) => {
              const x = (i / (weeks.length - 1)) * 100;
              const y = 100 - ((week.inDevelopment / maxValue) * 100);
              return (
                <g key={`dev-${i}`}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="5"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Highlight last point */}
                  {i === weeks.length - 1 && (
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="8"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="absolute left-12 right-0 bottom-0 h-12 flex items-center justify-between px-1">
            {weeks.map((week, i) => (
              <div key={i} className="text-xs font-medium text-gray-600">
                {week.week}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {hasData && (
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-800"></div>
            <span className="text-gray-700 font-medium">Ready to Engage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 8px, transparent 8px, transparent 13px)' }}></div>
            <span className="text-gray-700 font-medium">In Development</span>
          </div>
        </div>
      )}
    </div>
  );
}


