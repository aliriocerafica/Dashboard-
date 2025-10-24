"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Progress,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/LoadingSpinner";

interface WIGDashboardData {
  summary: {
    totalCommitments: number;
    completedCommitments: number;
    incompleteCommitments: number;
    commitmentRate: number;
  };
  officeScores: Array<{ office: string; score: number }>;
  unitScores: Array<{ unit: string; score: number }>;
  recentCommitments: Array<{
    sessionDate: string;
    department: string;
    leadStatement: string;
    status: string;
    dueDate: string;
  }>;
  trends: {
    weeklyCommitments: Array<{
      week: string;
      commitments: number;
      completed: number;
    }>;
    departmentPerformance: Array<{
      department: string;
      trend: string;
      change: number;
    }>;
  };
}

export default function PresidentDashboard() {
  const [data, setData] = useState<WIGDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("weekly-tracker");
  const [wigTrackerData, setWigTrackerData] = useState<any[]>([]);
  const [wigTrackerLoading, setWigTrackerLoading] = useState(false);
  const [wigTrackerError, setWigTrackerError] = useState<string | null>(null);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data: any[], filename: string) => {
    // For Excel export, we'll use a simple CSV format that Excel can open
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportData = () => {
    if (!data) return;

    if (selectedChart === "office-performance") {
      exportToCSV(data.officeScores, "office-performance-scores");
      exportToExcel(data.officeScores, "office-performance-scores");
    } else if (selectedChart === "weekly-trends") {
      exportToCSV(data.trends.weeklyCommitments, "weekly-commitment-trends");
      exportToExcel(data.trends.weeklyCommitments, "weekly-commitment-trends");
    }
  };

  useEffect(() => {
    const fetchWIGData = async () => {
      try {
        const response = await fetch("/api/get-wig-dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch WIG dashboard data");
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchWIGData();
  }, []);

  // Fetch Weekly WIG Tracker data when tab is active
  useEffect(() => {
    const fetchWigTrackerData = async () => {
      if (activeTab === "data-table" && wigTrackerData.length === 0) {
        setWigTrackerLoading(true);
        setWigTrackerError(null);

        try {
          const response = await fetch("/api/get-weekly-wig-tracker");
          if (!response.ok) {
            throw new Error("Failed to fetch Weekly WIG Tracker data");
          }

          const result = await response.json();
          if (result.success) {
            setWigTrackerData(result.data);
          } else {
            throw new Error(result.error || "Failed to fetch data");
          }
        } catch (err) {
          setWigTrackerError(
            err instanceof Error ? err.message : "An error occurred"
          );
        } finally {
          setWigTrackerLoading(false);
        }
      }
    };

    fetchWigTrackerData();
  }, [activeTab, wigTrackerData.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading WIG Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading WIG Data
          </h2>
          <p className="text-gray-900 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, officeScores, unitScores, recentCommitments, trends } = data;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-semibold text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-white"
            >
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                WIG Dashboard - Office of the President
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                Wildly Important Goals tracking and performance metrics
              </p>
            </div>
            <a
              href={
                process.env.NEXT_PUBLIC_SHEET_URL ||
                "https://docs.google.com/spreadsheets/d/placeholder-president-sheet/edit"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Original Sheet
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("weekly-tracker")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "weekly-tracker"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Weekly WIG Tracker
              </button>
              <button
                onClick={() => setActiveTab("data-table")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "data-table"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Data Table
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "weekly-tracker" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Total Commitments
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {summary.totalCommitments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {summary.completedCommitments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        In Progress
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {summary.incompleteCommitments}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Commitment Rate
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {summary.commitmentRate}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Office Performance Chart */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Office Performance Scores
                  </h3>
                  <Button
                    size="sm"
                    color="primary"
                    variant="solid"
                    onPress={() => setSelectedChart("office-performance")}
                    className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View More
                  </Button>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={officeScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="office"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="score"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              {/* Weekly Trends Chart */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Weekly Commitment Trends
                  </h3>
                  <Button
                    size="sm"
                    color="primary"
                    variant="solid"
                    onPress={() => setSelectedChart("weekly-trends")}
                    className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View More
                  </Button>
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.weeklyCommitments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="commitments"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>

            {/* Unit Performance Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Unit Performance Scores
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {unitScores.slice(0, 8).map((unit, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {unit.unit}
                          </p>
                          <Progress
                            value={unit.score}
                            className="mt-1"
                            color={
                              unit.score >= 60
                                ? "success"
                                : unit.score >= 40
                                ? "warning"
                                : "danger"
                            }
                          />
                        </div>
                        <div className="ml-4">
                          <span
                            className={`text-sm font-bold ${
                              unit.score >= 60
                                ? "text-green-700"
                                : unit.score >= 40
                                ? "text-orange-700"
                                : "text-red-700"
                            }`}
                          >
                            {unit.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Recent Commitments */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Commitments
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {recentCommitments.map((commitment, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              commitment.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {commitment.status}
                          </span>
                          <span className="text-xs text-gray-800 font-semibold">
                            {commitment.dueDate}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {commitment.department}
                        </p>
                        <p className="text-xs text-gray-900 line-clamp-2">
                          {commitment.leadStatement}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Department Performance Trends */}
            <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Department Performance Trends
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trends.departmentPerformance.map((dept, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {dept.trend === "up" ? (
                          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                        ) : dept.trend === "down" ? (
                          <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                        ) : (
                          <div className="w-5 h-5 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {dept.department}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          dept.change > 0
                            ? "text-green-600"
                            : dept.change < 0
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {dept.change > 0 ? "+" : ""}
                        {dept.change}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Full View Modal */}
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
                    {selectedChart === "office-performance" &&
                      "Office Performance Analysis"}
                    {selectedChart === "weekly-trends" &&
                      "Weekly Commitment Trends Analysis"}
                  </h3>
                  <p className="text-sm text-gray-700 font-medium">
                    Detailed chart analysis with interactive controls
                  </p>
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-6">
                    {/* Enhanced Chart Display */}
                    <div className="h-[500px] bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {selectedChart === "office-performance" && (
                        <div className="h-full">
                          <h4 className="text-lg font-semibold mb-4 text-gray-900">
                            Office Performance Scores - Full View
                          </h4>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={officeScores}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E5E7EB"
                              />
                              <XAxis
                                dataKey="office"
                                tick={{ fontSize: 12, fill: "#111827" }}
                                angle={-45}
                                textAnchor="end"
                                height={120}
                              />
                              <YAxis tick={{ fontSize: 12, fill: "#111827" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar
                                dataKey="score"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>

                          {/* Detailed Data Table */}
                          <div className="mt-6">
                            <h5 className="text-md font-semibold mb-3 text-gray-900">
                              Detailed Performance Data
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-900 font-semibold">
                                      Office
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Score
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Status
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Trend
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {officeScores.map((office, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100"
                                    >
                                      <td className="py-2 font-medium text-gray-900">
                                        {office.office}
                                      </td>
                                      <td className="text-right py-2 font-bold text-gray-900">
                                        {office.score}%
                                      </td>
                                      <td className="text-right py-2">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            office.score >= 60
                                              ? "bg-green-100 text-green-800"
                                              : office.score >= 40
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {office.score >= 60
                                            ? "Excellent"
                                            : office.score >= 40
                                            ? "Good"
                                            : "Needs Improvement"}
                                        </span>
                                      </td>
                                      <td className="text-right py-2">
                                        {office.score >= 60 ? (
                                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 inline" />
                                        ) : (
                                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600 inline" />
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedChart === "weekly-trends" && (
                        <div className="h-full">
                          <h4 className="text-lg font-semibold mb-4 text-gray-900">
                            Weekly Commitment Trends - Full View
                          </h4>
                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={trends.weeklyCommitments}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E5E7EB"
                              />
                              <XAxis
                                dataKey="week"
                                tick={{ fontSize: 12, fill: "#111827" }}
                              />
                              <YAxis tick={{ fontSize: 12, fill: "#111827" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="commitments"
                                stroke="#3B82F6"
                                strokeWidth={4}
                                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                                activeDot={{
                                  r: 8,
                                  stroke: "#3B82F6",
                                  strokeWidth: 2,
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#10B981"
                                strokeWidth={4}
                                dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                                activeDot={{
                                  r: 8,
                                  stroke: "#10B981",
                                  strokeWidth: 2,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Weekly Data Table */}
                          <div className="mt-6">
                            <h5 className="text-md font-semibold mb-3 text-gray-900">
                              Weekly Performance Data
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-900 font-semibold">
                                      Week
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Total Commitments
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Completed
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Completion Rate
                                    </th>
                                    <th className="text-right py-2 text-gray-900 font-semibold">
                                      Performance
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {trends.weeklyCommitments.map(
                                    (week, index) => {
                                      const completionRate = (
                                        (week.completed / week.commitments) *
                                        100
                                      ).toFixed(1);
                                      return (
                                        <tr
                                          key={index}
                                          className="border-b border-gray-100"
                                        >
                                          <td className="py-2 font-medium text-gray-900">
                                            {week.week}
                                          </td>
                                          <td className="text-right py-2 font-bold text-gray-900">
                                            {week.commitments}
                                          </td>
                                          <td className="text-right py-2 font-bold text-green-600">
                                            {week.completed}
                                          </td>
                                          <td className="text-right py-2 font-bold text-gray-900">
                                            {completionRate}%
                                          </td>
                                          <td className="text-right py-2">
                                            <span
                                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                parseFloat(completionRate) >= 70
                                                  ? "bg-green-100 text-green-800"
                                                  : parseFloat(
                                                      completionRate
                                                    ) >= 50
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}
                                            >
                                              {parseFloat(completionRate) >= 70
                                                ? "Excellent"
                                                : parseFloat(completionRate) >=
                                                  50
                                                ? "Good"
                                                : "Needs Improvement"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
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
                  <Button
                    color="primary"
                    className="text-black"
                    onPress={handleExportData}
                  >
                    Export Data
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}

        {/* Data Table Tab Content */}
        {activeTab === "data-table" && (
          <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="mb-6 px-4 sm:px-6 lg:px-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Live data from Google Sheets
                </p>
              </div>
            </div>

            {(() => {
              // Filter out empty rows
              const filteredData = wigTrackerData.filter((row) => {
                return (
                  row.sessionDate?.trim() ||
                  row.department?.trim() ||
                  row.subDepartment?.trim() ||
                  row.leadStatement?.trim() ||
                  row.commitment?.trim() ||
                  row.dueDate?.trim() ||
                  row.status?.trim()
                );
              });

              // Check which columns have data
              const hasSessionDate = filteredData.some((row) =>
                row.sessionDate?.trim()
              );
              const hasDepartment = filteredData.some((row) =>
                row.department?.trim()
              );
              const hasSubDepartment = filteredData.some((row) =>
                row.subDepartment?.trim()
              );
              const hasLeadStatement = filteredData.some((row) =>
                row.leadStatement?.trim()
              );
              const hasCommitment = filteredData.some((row) =>
                row.commitment?.trim()
              );
              const hasDueDate = filteredData.some((row) =>
                row.dueDate?.trim()
              );
              const hasStatus = filteredData.some((row) => row.status?.trim());

              return (
                <>
                  {wigTrackerLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="md" text="Loading data..." />
                    </div>
                  ) : wigTrackerError ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-4xl mb-4">⚠️</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Error Loading WIG Tracker Data
                      </h4>
                      <p className="text-gray-600 mb-4">{wigTrackerError}</p>
                      <Button
                        onClick={() => {
                          setWigTrackerData([]);
                          setWigTrackerError(null);
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : wigTrackerData.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">📊</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No Data Available
                      </h4>
                      <p className="text-gray-600">
                        No data found in the Google Sheet.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50 border-b border-gray-200">
                              {hasSessionDate && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Session Date
                                </th>
                              )}
                              {hasDepartment && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Department
                                </th>
                              )}
                              {hasSubDepartment && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Sub-Department
                                </th>
                              )}
                              {hasLeadStatement && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Lead Statement
                                </th>
                              )}
                              {hasCommitment && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Commitment
                                </th>
                              )}
                              {hasDueDate && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Due Date
                                </th>
                              )}
                              {hasStatus && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                  Status
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((row, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors duration-150"
                              >
                                {hasSessionDate && (
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {row.sessionDate?.trim() || "-"}
                                  </td>
                                )}
                                {hasDepartment && (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {row.department?.trim() || "-"}
                                  </td>
                                )}
                                {hasSubDepartment && (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {row.subDepartment?.trim() || "-"}
                                  </td>
                                )}
                                {hasLeadStatement && (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {row.leadStatement?.trim() || "-"}
                                  </td>
                                )}
                                {hasCommitment && (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {row.commitment?.trim() || "-"}
                                  </td>
                                )}
                                {hasDueDate && (
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {row.dueDate?.trim() || "-"}
                                  </td>
                                )}
                                {hasStatus && (
                                  <td className="px-4 py-3">
                                    {row.status?.trim() ? (
                                      <span
                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          row.status
                                            .toLowerCase()
                                            .includes("completed")
                                            ? "bg-green-100 text-green-800"
                                            : row.status
                                                .toLowerCase()
                                                .includes("in progress")
                                            ? "bg-blue-100 text-blue-800"
                                            : row.status
                                                .toLowerCase()
                                                .includes("pending")
                                            ? "bg-yellow-100 text-yellow-800"
                                            : row.status
                                                .toLowerCase()
                                                .includes("incomplete")
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {row.status}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        -
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                          Showing {filteredData.length} of{" "}
                          {wigTrackerData.length} results
                        </p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
