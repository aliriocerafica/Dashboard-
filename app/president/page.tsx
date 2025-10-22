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
  PieChart,
  Pie,
  Cell,
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
          <p className="text-gray-600 mb-6">{error}</p>
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
          <p className="font-semibold">{label}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WIG Dashboard - Office of the President
          </h1>
          <p className="text-gray-600">
            Wildly Important Goals tracking and performance metrics
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
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
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
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
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
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
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
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
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Office Performance Scores
              </h3>
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
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Weekly Trends Chart */}
          <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Weekly Commitment Trends
              </h3>
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
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
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
                    <p className="text-xs text-gray-600 line-clamp-2">
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
                        : "text-gray-600"
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
      </div>
    </div>
  );
}
