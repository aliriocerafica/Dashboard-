"use client";

interface ChartData {
  name: string;
  value: number;
}

interface DPOChartsProps {
  data: ChartData[];
  type: "pie" | "bar";
}

export default function DPOCharts({ data, type }: DPOChartsProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No data available</div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (type === "pie") {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage =
            total > 0 ? Math.round((item.value / total) * 100) : 0;
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-purple-500",
            "bg-indigo-500",
            "bg-pink-500",
            "bg-gray-500",
          ];
          const color = colors[index % colors.length];

          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${color}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
                <span className="text-xs text-gray-500">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "bar") {
    const maxValue = Math.max(...data.map((item) => item.value));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-purple-500",
            "bg-indigo-500",
            "bg-pink-500",
            "bg-gray-500",
          ];
          const color = colors[index % colors.length];

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
