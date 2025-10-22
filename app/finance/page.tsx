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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Finance Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Financial management and payment tracking
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
            <Button
              className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                activeTab === "payroll"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onPress={() => setActiveTab("payroll")}
            >
              Payroll Concerns
            </Button>
            <Button
              className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                activeTab === "invoices"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onPress={() => setActiveTab("invoices")}
            >
              Client Invoice Commitment
            </Button>
          </div>
        </div>

        {/* Payroll Concerns Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payroll concerns...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error Loading Data
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : payrollData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Total Concerns
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {payrollData.summary.totalConcerns}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BanknotesIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Pending Concerns
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {payrollData.summary.pendingConcerns}
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
                            Resolved
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {payrollData.summary.resolvedConcerns}
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
                            In Review
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {payrollData.summary.inReviewConcerns}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Weekly Concerns Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Weekly Raise Concerns
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Number of concerns raised per week
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={payrollData.concerns
                            .reduce((acc: any[], concern: any) => {
                              const date = new Date(concern.payrollDate);
                              const weekStart = new Date(date);
                              weekStart.setDate(date.getDate() - date.getDay());
                              const weekKey = weekStart
                                .toISOString()
                                .split("T")[0];

                              const existingWeek = acc.find(
                                (w) => w.week === weekKey
                              );
                              if (existingWeek) {
                                existingWeek.concerns += 1;
                              } else {
                                acc.push({
                                  week: weekKey,
                                  concerns: 1,
                                  weekLabel: `Week ${acc.length + 1}`,
                                });
                              }
                              return acc;
                            }, [])
                            .map((week: any, index: number) => ({
                              week: week.weekLabel || `Week ${index + 1}`,
                              concerns: week.concerns,
                              date: week.week,
                            }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
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

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      Weekly trend of payroll concerns raised
                    </p>
                  </div>
                </div>

                {/* Payroll Concerns Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Payroll Concerns
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {payrollData.summary.totalConcerns} Total
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto">
                        + View All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Resolved
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payrollData.concerns.map((concern: any) => (
                          <tr key={concern.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {concern.payrollDate}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Confidential Data
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Confidential Data
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {concern.concernType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  concern.status === "Resolved"
                                    ? "bg-green-100 text-green-800"
                                    : concern.status === "In Review"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {concern.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {concern.dateResolved || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      Showing {payrollData.concerns.length} of{" "}
                      {payrollData.summary.totalConcerns} results
                    </p>
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
