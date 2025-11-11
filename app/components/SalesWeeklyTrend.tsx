"use client";

import { SalesData } from "../lib/sheets";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

interface SalesWeeklyTrendProps {
  data: SalesData[];
}

export default function SalesWeeklyTrend({ data }: SalesWeeklyTrendProps) {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Process data to get weekly trends
  const getWeeklyData = () => {
    const weeks = new Map<
      string,
      { week: string; total: number; ready: number; develop: number }
    >();

    data.forEach((item) => {
      if (!item.date) return;

      const date = new Date(item.date);
      // Get week number
      const weekNum = Math.ceil(date.getDate() / 7);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const weekKey = `${monthName} W${weekNum}`;

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { week: weekKey, total: 0, ready: 0, develop: 0 });
      }

      const week = weeks.get(weekKey)!;
      week.total += 1;

      if (item.fitLevel === "Ready to Engage") week.ready += 1;
      if (item.fitLevel === "Develop & Qualify") week.develop += 1;
    });

    // Convert to array and get last 8 weeks
    const weekArray = Array.from(weeks.values()).slice(-8);
    return weekArray;
  };

  const weeklyData = getWeeklyData();
  const currentWeek = weeklyData[weeklyData.length - 1];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-semibold">{`Week: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 lg:p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Weekly Growth Trend
              </h3>
              <p className="text-sm text-gray-600">
                Lead generation over the past weeks
              </p>
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            variant="solid"
            onPress={() => setSelectedChart("weekly-trend")}
            className="text-xs bg-blue-600 text-white hover:bg-blue-700"
          >
            View More
          </Button>
        </CardHeader>
        <CardBody className="px-3 sm:px-4 lg:px-6 flex-1">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <defs>
                  <linearGradient
                    id="totalGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="readyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="developGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />

                {/* Total leads bar */}
                <Bar
                  dataKey="total"
                  fill="url(#totalGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="#3B82F6"
                  strokeWidth={1}
                />

                {/* Ready to engage bar */}
                <Bar
                  dataKey="ready"
                  fill="url(#readyGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="#10B981"
                  strokeWidth={1}
                />

                {/* Develop & qualify bar */}
                <Bar
                  dataKey="develop"
                  fill="url(#developGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="#F97316"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </CardBody>

        {/* Summary Cards inside the main card */}
        <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentWeek?.total || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">This Week Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {currentWeek?.ready || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Ready to Engage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {currentWeek?.develop || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Develop & Qualify
              </div>
            </div>
          </div>

          {/* Legend inside the main card */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-xs text-gray-600">Total Leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              <span className="text-xs text-gray-600">Ready to Engage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">Develop & Qualify</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Chart Detail Modal */}
      <Modal
        isOpen={selectedChart !== null}
        onClose={() => setSelectedChart(null)}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
        placement="center"
        className="max-w-7xl"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50 backdrop-blur-md",
          header: "bg-white",
          body: "bg-white",
          footer: "bg-white",
        }}
      >
        <ModalContent className="bg-white">
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-gray-900">
              Weekly Growth Trend Analysis
            </h3>
            <p className="text-sm text-gray-700 font-medium">
              Detailed weekly performance metrics and export options
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {/* Enhanced chart display */}
              <div className="h-[500px] bg-white rounded-lg p-4 border border-gray-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <defs>
                      <linearGradient
                        id="modalTotalGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="modalReadyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="modalDevelopGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F97316"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F97316"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                      dataKey="total"
                      fill="url(#modalTotalGradient)"
                      radius={[6, 6, 0, 0]}
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />

                    <Bar
                      dataKey="ready"
                      fill="url(#modalReadyGradient)"
                      radius={[6, 6, 0, 0]}
                      stroke="#10B981"
                      strokeWidth={2}
                    />

                    <Bar
                      dataKey="develop"
                      fill="url(#modalDevelopGradient)"
                      radius={[6, 6, 0, 0]}
                      stroke="#F97316"
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setSelectedChart(null)}
              className="text-black"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
