"use client";

import { SalesData } from "../lib/sheets";

interface SalesWeeklyTrendProps {
  data: SalesData[];
}

export default function SalesWeeklyTrend({ data }: SalesWeeklyTrendProps) {
  // Process data to get weekly trends
  const getWeeklyData = () => {
    const weeks = new Map<
      string,
      { total: number; ready: number; develop: number }
    >();

    data.forEach((item) => {
      if (!item.date) return;

      const date = new Date(item.date);
      // Get week number
      const weekNum = Math.ceil(date.getDate() / 7);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const weekKey = `${monthName} W${weekNum}`;

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { total: 0, ready: 0, develop: 0 });
      }

      const week = weeks.get(weekKey)!;
      week.total += 1;

      if (item.fitLevel === "Ready to Engage") week.ready += 1;
      if (item.fitLevel === "Develop & Qualify") week.develop += 1;
    });

    // Convert to array and get last 8 weeks
    const weekArray = Array.from(weeks.entries())
      .map(([week, stats]) => ({ week, ...stats }))
      .slice(-8);

    return weekArray;
  };

  const weeklyData = getWeeklyData();
  const maxValue = Math.max(...weeklyData.map((d) => d.total), 10);
  const chartHeight = 160;

  // Calculate SVG points for line
  const getPoints = (dataKey: "total" | "ready" | "develop") => {
    return weeklyData
      .map((item, index) => {
        const x = (index / (weeklyData.length - 1)) * 100;
        const y = 100 - (item[dataKey] / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Weekly Growth Trend
          </h3>
          <p className="text-xs text-gray-500">
            Lead generation over the past weeks
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="text-gray-600">Total Leads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <span className="text-gray-600">Ready to Engage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">Develop & Qualify</span>
          </div>
        </div>
      </div>

      {weeklyData.length > 0 ? (
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient
                id="blueGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#3B82F6", stopOpacity: 0.1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#3B82F6", stopOpacity: 0 }}
                />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Total leads line with gradient fill */}
            <polyline
              points={getPoints("total")}
              fill="url(#blueGradient)"
              stroke="#3B82F6"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              style={{
                transform: "scale(0.98, 1)",
                transformOrigin: "center",
              }}
            />

            {/* Ready to engage line */}
            <polyline
              points={getPoints("ready")}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              style={{
                transform: "scale(0.98, 1)",
                transformOrigin: "center",
              }}
            />

            {/* Develop & qualify line */}
            <polyline
              points={getPoints("develop")}
              fill="none"
              stroke="#F97316"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              style={{
                transform: "scale(0.98, 1)",
                transformOrigin: "center",
              }}
            />

            {/* Data points */}
            {weeklyData.map((item, index) => {
              const x = (index / (weeklyData.length - 1)) * 100;
              const yTotal = 100 - (item.total / maxValue) * 100;

              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${yTotal}%`}
                    r="4"
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      )}

      {/* X-axis labels */}
      <div className="flex justify-between mt-3 text-[10px] text-gray-600">
        {weeklyData.map((item, index) => (
          <div
            key={index}
            className="text-center"
            style={{ width: `${100 / weeklyData.length}%` }}
          >
            {item.week}
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {weeklyData[weeklyData.length - 1]?.total || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            This Week Total
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-600">
            {weeklyData[weeklyData.length - 1]?.ready || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Ready to Engage
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-500">
            {weeklyData[weeklyData.length - 1]?.develop || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Develop & Qualify
          </div>
        </div>
      </div>
    </div>
  );
}
