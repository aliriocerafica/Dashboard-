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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

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

const refreshWIGData = async () => {
  setRefreshing(true);
  setError(null);
      try {
        const response = await fetch("/api/get-wig-dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch WIG dashboard data");
        }
        const result = await response.json();
        setData(result.data);
    setLastUpdated(result.lastUpdated || new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
    setRefreshing(false);
        setLoading(false);
      }
    };

useEffect(() => {
  // Do not auto-fetch on mount; user can refresh on demand
  setLoading(false);
  }, []);

  // No secondary data table fetching; dashboard uses aggregated API only

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

  if (!data)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Click the button below to load the latest data from Google Sheets.</p>
            <button
              onClick={refreshWIGData}
              disabled={refreshing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                refreshing
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>
    );

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
            <div className="flex items-center gap-2">
              <button
                onClick={refreshWIGData}
                disabled={refreshing}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                  refreshing
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {refreshing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6" />
                  </svg>
                )}
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1qp_5G8qnw_T1AUYMW4zQhgTzSo5kfX8AczOEM6jO-xw/edit?gid=1673922593#gid=1673922593"
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
        </div>

          

        

        {/* Single Tab Header */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <span className="py-2 px-1 border-b-2 font-medium text-sm border-emerald-500 text-emerald-600">
                Dashboard
              </span>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {
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

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Weekly Commitment Trends</h3>
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
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={trends.weeklyCommitments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="commitments" stroke="#3B82F6" strokeWidth={3} />
                      <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Commitment Score Per Office</h3>
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
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={officeScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="office" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#3B82F6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>

            {/* Performance Tables (moved out of modal) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Detailed Performance Data (Per Office) */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Data</h3>
                </CardHeader>
                <CardBody>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-900 font-semibold">Office</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Score</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Status</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officeScores.map((office, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 font-medium text-gray-900">{office.office}</td>
                            <td className="text-right py-2 font-bold text-gray-900">{office.score}%</td>
                            <td className="text-right py-2">
                          <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  office.score >= 70
                                    ? "bg-green-100 text-green-800"
                                    : office.score >= 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {office.score >= 70
                                  ? "Excellent"
                                  : office.score >= 50
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
                </CardBody>
              </Card>

              {/* Weekly Performance Data */}
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Performance Data</h3>
                </CardHeader>
                <CardBody>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-900 font-semibold">Week</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Total Commitments</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Completed</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Completion Rate</th>
                          <th className="text-right py-2 text-gray-900 font-semibold">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.weeklyCommitments.map((week, index) => {
                          const rate = week.commitments
                            ? ((week.completed / week.commitments) * 100).toFixed(1)
                            : "0.0";
                          const rateNum = parseFloat(rate);
                          const perfClass =
                            rateNum >= 70
                                ? "bg-green-100 text-green-800"
                              : rateNum >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800";
                          const perfLabel = rateNum >= 70 ? "Excellent" : rateNum >= 50 ? "Good" : "Needs Improvement";
                          return (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 font-medium text-gray-900">{week.week}</td>
                              <td className="text-right py-2 font-bold text-gray-900">{week.commitments}</td>
                              <td className="text-right py-2 font-bold text-green-600">{week.completed}</td>
                              <td className="text-right py-2 font-bold text-gray-900">{rate}%</td>
                              <td className="text-right py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${perfClass}`}>{perfLabel}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Removed secondary duplicate charts per request */}

            {/* Removed Unit Performance list and Recent Commitments per request */}

            {/* Removed Department Performance Trends per request */}

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
        }

        {/* Data table removed as requested */}
      </div>
    </div>
  );
}
