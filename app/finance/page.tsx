"use client";

import { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import MobileTable from "@/app/components/MobileTable";
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
} from "recharts";
import { LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("payroll");
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real payroll concerns data
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-payroll-concerns");
        if (!response.ok) {
          throw new Error("Failed to fetch payroll concerns");
        }
        const result = await response.json();
        if (result.success) {
          setPayrollData(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching payroll data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  // Sample data for Client Invoice Commitment
  const invoiceData = {
    summary: {
      totalInvoices: 28,
      pendingInvoices: 8,
      paidInvoices: 20,
      totalAmount: 450000,
    },
    commitments: [
      {
        id: 1,
        client: "ABC Corporation",
        invoiceNumber: "INV-2024-001",
        amount: 25000,
        dueDate: "2024-01-25",
        status: "Pending",
        priority: "High",
      },
      {
        id: 2,
        client: "XYZ Ltd",
        invoiceNumber: "INV-2024-002",
        amount: 15000,
        dueDate: "2024-01-30",
        status: "Overdue",
        priority: "Critical",
      },
      {
        id: 3,
        client: "Tech Solutions Inc",
        invoiceNumber: "INV-2024-003",
        amount: 35000,
        dueDate: "2024-02-05",
        status: "Paid",
        priority: "Medium",
      },
    ],
  };

  const monthlyRevenue = [
    { month: "Jan", revenue: 120000, expenses: 80000 },
    { month: "Feb", revenue: 135000, expenses: 85000 },
    { month: "Mar", revenue: 150000, expenses: 90000 },
    { month: "Apr", revenue: 140000, expenses: 88000 },
    { month: "May", revenue: 160000, expenses: 95000 },
    { month: "Jun", revenue: 175000, expenses: 100000 },
  ];

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
              {`${entry.dataKey}: $${entry.value.toLocaleString()}`}
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
                Finance Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                Financial management and reporting
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1D2Du8AeSWHVMSsHfe6Yxu6WxbLXrLvuMWU-h83YOgQQ/edit?gid=222330370#gid=222330370"
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
                onClick={() => setActiveTab("payroll")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payroll"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payroll Concerns
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Invoices
              </button>
            </nav>
          </div>
        </div>

        {/* Payroll Concerns Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payroll concerns...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Error Loading Data
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : payrollData ? (
              <>
                {/* Mobile App Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs opacity-80">Total</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {payrollData.summary.totalConcerns}
                    </div>
                    <div className="text-xs opacity-80">Concerns</div>
                  </div>

                  <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs opacity-80">Pending</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {payrollData.summary.pendingConcerns}
                    </div>
                    <div className="text-xs opacity-80">Awaiting</div>
                  </div>

                  <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs opacity-80">Resolved</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {payrollData.summary.resolvedConcerns}
                    </div>
                    <div className="text-xs opacity-80">Completed</div>
                  </div>

                  <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs opacity-80">In Review</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {payrollData.summary.inReviewConcerns}
                    </div>
                    <div className="text-xs opacity-80">Processing</div>
                  </div>
                </div>

                {/* Mobile App Weekly Chart */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Weekly Trends
                    </h3>
                    <span className="text-sm text-gray-500">
                      Concerns raised
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(() => {
                          // Group concerns by week
                          const weeklyGroups: { [key: string]: number } = {};

                          console.log(
                            "Total concerns from API:",
                            payrollData.concerns.length
                          );
                          console.log("All concerns:", payrollData.concerns);

                          payrollData.concerns.forEach(
                            (concern: any, index: number) => {
                              const dateStr = concern.payrollDate;
                              console.log(`Concern ${index + 1}:`, {
                                payrollDate: dateStr,
                                concernType: concern.concernType,
                                status: concern.status,
                              });

                              if (!dateStr || dateStr.trim() === "") {
                                console.log(
                                  `Concern ${
                                    index + 1
                                  } has no date - grouping into 'No Date' category`
                                );
                                // Group concerns with no date into a special category
                                weeklyGroups["no-date"] =
                                  (weeklyGroups["no-date"] || 0) + 1;
                                return;
                              }

                              const date = new Date(dateStr);
                              console.log(
                                `Parsing date "${dateStr}" -> ${date.toISOString()}`
                              );

                              // Check if date is valid
                              if (isNaN(date.getTime())) {
                                console.warn("Invalid date:", dateStr);
                                return; // Skip invalid dates
                              }

                              // Get the start of the week (Sunday)
                              const weekStart = new Date(date);
                              weekStart.setDate(date.getDate() - date.getDay());
                              weekStart.setHours(0, 0, 0, 0);

                              const weekKey = weekStart
                                .toISOString()
                                .split("T")[0];

                              console.log(
                                `Concern ${index + 1} grouped into week:`,
                                weekKey
                              );

                              // Count concerns for this week
                              weeklyGroups[weekKey] =
                                (weeklyGroups[weekKey] || 0) + 1;
                            }
                          );

                          // Convert to array and sort by date
                          const weeklyData = Object.entries(weeklyGroups)
                            .map(([weekKey, concerns], index) => {
                              // Handle the special "no-date" category
                              if (weekKey === "no-date") {
                                return {
                                  week: "No Date",
                                  concerns: concerns,
                                  date: "no-date",
                                };
                              }
                              return {
                                week: `Week ${index + 1}`,
                                concerns: concerns,
                                date: weekKey,
                              };
                            })
                            .sort((a, b) => {
                              // Put "no-date" at the end
                              if (a.date === "no-date") return 1;
                              if (b.date === "no-date") return -1;
                              return (
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime()
                              );
                            });

                          console.log("Weekly groups:", weeklyGroups);
                          console.log("Final weekly data:", weeklyData);

                          // Return data or fallback
                          return weeklyData.length > 0
                            ? weeklyData
                            : [{ week: "No Data", concerns: 0, date: "" }];
                        })()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="week"
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          labelStyle={{ color: "#374151", fontWeight: "600" }}
                        />
                        <Bar
                          dataKey="concerns"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          stroke="#2563eb"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mobile App Concerns List */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Concerns
                    </h3>
                    <span className="text-sm text-gray-500">
                      {payrollData.summary.totalConcerns} total
                    </span>
                  </div>
                  <div className="space-y-3">
                    {payrollData.concerns.slice(0, 5).map((concern: any) => (
                      <div
                        key={concern.id}
                        className="p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {concern.concernType}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              concern.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : concern.status === "In Review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {concern.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {concern.payrollDate}
                        </div>
                        {concern.dateResolved && (
                          <div className="text-xs text-gray-400 mt-1">
                            Resolved: {concern.dateResolved}
                          </div>
                        )}
                      </div>
                    ))}
                    {payrollData.concerns.length > 5 && (
                      <button className="w-full py-2 text-blue-500 text-sm font-medium">
                        View All {payrollData.concerns.length} Concerns
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Client Invoice Commitment Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Total Invoices
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {invoiceData.summary.totalInvoices}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Pending Invoices
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {invoiceData.summary.pendingInvoices}
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
                      <p className="text-sm font-medium text-gray-800">
                        Paid Invoices
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {invoiceData.summary.paidInvoices}
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
                      <p className="text-sm font-medium text-gray-800">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${invoiceData.summary.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Monthly Revenue vs Expenses
                </h3>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Invoice Commitments Table */}
            <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Client Invoice Commitments
                </h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Invoice commitments table">
                  <TableHeader>
                    <TableColumn className="text-black font-semibold">
                      CLIENT
                    </TableColumn>
                    <TableColumn className="text-black font-semibold">
                      INVOICE #
                    </TableColumn>
                    <TableColumn className="text-black font-semibold">
                      AMOUNT
                    </TableColumn>
                    <TableColumn className="text-black font-semibold">
                      DUE DATE
                    </TableColumn>
                    <TableColumn className="text-black font-semibold">
                      STATUS
                    </TableColumn>
                    <TableColumn className="text-black font-semibold">
                      PRIORITY
                    </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {invoiceData.commitments.map((commitment) => (
                      <TableRow key={commitment.id}>
                        <TableCell className="font-medium text-black">
                          {commitment.client}
                        </TableCell>
                        <TableCell className="text-black">
                          {commitment.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-black">
                          ${commitment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-black">
                          {commitment.dueDate}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={
                              commitment.status === "Paid"
                                ? "success"
                                : commitment.status === "Overdue"
                                ? "danger"
                                : "warning"
                            }
                            variant="flat"
                            className="text-black"
                          >
                            {commitment.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={
                              commitment.priority === "Critical"
                                ? "danger"
                                : commitment.priority === "High"
                                ? "warning"
                                : "default"
                            }
                            variant="flat"
                            className="text-black"
                          >
                            {commitment.priority}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
