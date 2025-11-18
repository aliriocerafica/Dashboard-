"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChartBarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/LoadingSpinner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface DepartmentSummary {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  metrics: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    trend: number; // percentage change
  };
  link: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>(null);
  const [marketingData, setMarketingData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [hrData, setHRData] = useState<any>(null);
  const [itData, setITData] = useState<any>(null);
  const [dpoData, setDpoData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"completed" | "inProgress" | "pending" | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  useEffect(() => {
    fetchAllDepartmentData();
  }, []);

  const fetchAllDepartmentData = async () => {
    setLoading(true);
    try {
      // Fetch all department data in parallel
      const [sales, marketing, finance, hr, it, dpo] = await Promise.allSettled([
        fetch("/api/get-client-payments").then((r) => r.json()),
        fetch("/api/get-marketing-gantt").then((r) => r.json()),
        fetch("/api/get-payroll-concerns").then((r) => r.json()),
        fetch("/api/get-payroll-concerns").then((r) => r.json()), // Using same for HR
        fetch("/api/get-it-tasks").then((r) => r.json()),
        fetch("/api/get-dpo-overview").then((r) => r.json()),
      ]);

      if (sales.status === "fulfilled") {
        console.log("Sales data:", sales.value);
        setSalesData(sales.value);
      }
      if (marketing.status === "fulfilled") {
        console.log("Marketing data:", marketing.value);
        setMarketingData(marketing.value);
      }
      if (finance.status === "fulfilled") {
        console.log("Finance data:", finance.value);
        setFinanceData(finance.value);
      }
      if (hr.status === "fulfilled") {
        console.log("HR data:", hr.value);
        setHRData(hr.value);
      }
      if (it.status === "fulfilled") {
        console.log("IT data:", it.value);
        setITData(it.value);
      }
      if (dpo.status === "fulfilled") {
        console.log("DPO data:", dpo.value);
        setDpoData(dpo.value);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate department summaries
  const getDepartmentSummaries = (): DepartmentSummary[] => {
    const summaries: DepartmentSummary[] = [];

    // Sales Summary
    if (salesData?.data?.payments && Array.isArray(salesData.data.payments)) {
      const payments = salesData.data.payments;
      const summary = salesData.data.summary;
      const total = payments.length;
      const completed = (summary?.paidEarly || 0) + (summary?.paidOnTime || 0);
      const pending = summary?.notYetPaid || 0;
      const inProgress = summary?.paidLate || 0;
      
      summaries.push({
        name: "Sales",
        icon: ChartBarIcon,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress,
          trend: 5.2,
        },
        link: "/sales",
      });
    } else {
      // Default Sales data if no data available
      summaries.push({
        name: "Sales",
        icon: ChartBarIcon,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/sales",
      });
    }

    // Marketing Summary
    if (marketingData?.data?.items && Array.isArray(marketingData.data.items)) {
      const items = marketingData.data.items;
      const statusCounts = marketingData.data.statusCounts || {};
      
      const completed = statusCounts.Completed || 0;
      const pending = (statusCounts.Delayed || 0) + (statusCounts["On Hold"] || 0);
      const inProgress = (statusCounts.Ongoing || 0) + (statusCounts.Target || 0);
      const total = items.length;
      
      summaries.push({
        name: "Marketing",
        icon: MegaphoneIcon,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress,
          trend: 3.1,
        },
        link: "/marketing",
      });
    } else {
      summaries.push({
        name: "Marketing",
        icon: MegaphoneIcon,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/marketing",
      });
    }

    // Finance Summary (using payroll concerns)
    if (financeData?.data?.summary) {
      const summary = financeData.data.summary;
      const total = summary.totalConcerns || 0;
      const completed = summary.resolvedConcerns || 0;
      const pending = summary.pendingConcerns || 0;
      const inProgress = summary.onProcessConcerns || 0;
      
      summaries.push({
        name: "Finance",
        icon: CurrencyDollarIcon,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress,
          trend: 2.8,
        },
        link: "/finance",
      });
    } else {
      summaries.push({
        name: "Finance",
        icon: CurrencyDollarIcon,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/finance",
      });
    }

    // HR Summary (using payroll concerns/hr data)
    if (hrData?.data?.summary) {
      const summary = hrData.data.summary;
      const total = summary.totalConcerns || 0;
      const completed = summary.resolvedConcerns || 0;
      const pending = summary.pendingConcerns || 0;
      const inProgress = summary.onProcessConcerns || 0;
      
      summaries.push({
        name: "HR",
        icon: UserGroupIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress,
          trend: 1.5,
        },
        link: "/hr",
      });
    } else {
      summaries.push({
        name: "HR",
        icon: UserGroupIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/hr",
      });
    }

    // Operations Summary
    summaries.push({
      name: "Operations",
      icon: CogIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      metrics: {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        trend: 4.3,
      },
      link: "/operations",
    });

    // IT Summary
    if (itData?.data?.tasks && Array.isArray(itData.data.tasks)) {
      const summary = itData.data.summary;
      const total = summary?.totalTasks || 0;
      const completed = summary?.completed || 0;
      const pending = summary?.toDo || 0;
      const inProgress = (summary?.inProgress || 0) + (summary?.ongoing || 0);
      
      summaries.push({
        name: "IT",
        icon: ComputerDesktopIcon,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress,
          trend: 6.7,
        },
        link: "/it",
      });
    } else {
      // Default IT data if no data available
      summaries.push({
        name: "IT",
        icon: ComputerDesktopIcon,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/it",
      });
    }

    // DPO Summary
    if (dpoData?.data?.summary) {
      const summary = dpoData.data.summary;
      const total = summary.totalTasks || 0;
      const completed = summary.completedTasks || 0;
      const pending = summary.pendingTasks || 0;
      const overdue = summary.overdueTasks || 0;
      
      summaries.push({
        name: "DPO",
        icon: ShieldCheckIcon,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        metrics: {
          total,
          completed,
          pending,
          inProgress: overdue, // Using overdue as inProgress for visibility
          trend: summary.completionRate || 0,
        },
        link: "/dpo",
      });
    } else {
      summaries.push({
        name: "DPO",
        icon: ShieldCheckIcon,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        metrics: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          trend: 0,
        },
        link: "/dpo",
      });
    }

    return summaries;
  };

  const departmentSummaries = getDepartmentSummaries();

  // Calculate overall company metrics
  const getTotalMetrics = () => {
    const totals = {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
    };

    departmentSummaries.forEach((dept) => {
      totals.total += dept.metrics.total;
      totals.completed += dept.metrics.completed;
      totals.pending += dept.metrics.pending;
      totals.inProgress += dept.metrics.inProgress;
    });

    return totals;
  };

  const totalMetrics = getTotalMetrics();
  const completionRate = totalMetrics.total > 0 ? ((totalMetrics.completed / totalMetrics.total) * 100).toFixed(1) : "0";

  // Chart data for department comparison
  const departmentChartData = departmentSummaries.map((dept) => ({
    name: dept.name,
    Completed: dept.metrics.completed,
    Pending: dept.metrics.pending,
    "In Progress": dept.metrics.inProgress,
  }));

  // Get tasks by status across all departments
  const getTasksByStatus = (status: "completed" | "inProgress" | "pending") => {
    const tasks: Array<{ department: string; task: string; status: string; details: any }> = [];

    // Sales tasks
    if (salesData?.data?.payments && Array.isArray(salesData.data.payments)) {
      salesData.data.payments.forEach((payment: any) => {
        const paymentStatus = payment.paymentStatus?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (paymentStatus.includes("paid early") || paymentStatus.includes("paid on time")) {
          taskStatus = "completed";
        } else if (paymentStatus.includes("paid late")) {
          taskStatus = "inProgress";
        } else if (paymentStatus.includes("not yet paid")) {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "Sales",
            task: payment.clientName || "Client Payment",
            status: payment.paymentStatus || "Unknown",
            details: payment,
          });
        }
      });
    }

    // Marketing tasks
    if (marketingData?.data?.items && Array.isArray(marketingData.data.items)) {
      marketingData.data.items.forEach((item: any) => {
        const itemStatus = item.status?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (itemStatus === "completed") {
          taskStatus = "completed";
        } else if (itemStatus === "ongoing" || itemStatus === "target") {
          taskStatus = "inProgress";
        } else {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "Marketing",
            task: item.activity || "Marketing Activity",
            status: item.status || "Unknown",
            details: item,
          });
        }
      });
    }

    // Finance tasks (payroll concerns)
    if (financeData?.data?.concerns && Array.isArray(financeData.data.concerns)) {
      financeData.data.concerns.forEach((concern: any) => {
        const concernStatus = concern.status?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (concernStatus === "resolved") {
          taskStatus = "completed";
        } else if (concernStatus === "on process") {
          taskStatus = "inProgress";
        } else {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "Finance",
            task: concern.concernType || "Payroll Concern",
            status: concern.status || "Unknown",
            details: concern,
          });
        }
      });
    }

    // HR tasks (same as finance - payroll concerns)
    if (hrData?.data?.concerns && Array.isArray(hrData.data.concerns)) {
      hrData.data.concerns.forEach((concern: any) => {
        const concernStatus = concern.status?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (concernStatus === "resolved") {
          taskStatus = "completed";
        } else if (concernStatus === "on process") {
          taskStatus = "inProgress";
        } else {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "HR",
            task: concern.concernType || "HR Concern",
            status: concern.status || "Unknown",
            details: concern,
          });
        }
      });
    }

    // IT tasks
    if (itData?.data?.tasks && Array.isArray(itData.data.tasks)) {
      itData.data.tasks.forEach((task: any) => {
        const itStatus = task.status?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (itStatus === "completed") {
          taskStatus = "completed";
        } else if (itStatus === "in progress" || itStatus === "ongoing") {
          taskStatus = "inProgress";
        } else {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "IT",
            task: task.troubleshootingType || "IT Task",
            status: task.status || "Unknown",
            details: task,
          });
        }
      });
    }

    // DPO tasks
    if (dpoData?.data?.tasks && Array.isArray(dpoData.data.tasks)) {
      dpoData.data.tasks.forEach((task: any) => {
        const dpoStatus = task.status?.toLowerCase() || "";
        let taskStatus = "pending";
        
        if (dpoStatus === "completed" || task.dateCompleted) {
          taskStatus = "completed";
        } else if (dpoStatus === "in progress") {
          taskStatus = "inProgress";
        } else {
          taskStatus = "pending";
        }

        if ((status === "completed" && taskStatus === "completed") ||
            (status === "inProgress" && taskStatus === "inProgress") ||
            (status === "pending" && taskStatus === "pending")) {
          tasks.push({
            department: "DPO",
            task: task.taskName || "DPO Task",
            status: task.status || "Unknown",
            details: task,
          });
        }
      });
    }

    return tasks;
  };

  const handleStatusClick = (status: "completed" | "inProgress" | "pending") => {
    setSelectedStatus(status);
    setModalSearchTerm(""); // Clear search when opening modal
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading overview dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <EyeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Executive Overview Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time insights across all departments
              </p>
            </div>
          </div>
        </div>

        {/* Overall Company Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Tasks</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMetrics.total}</p>
            <p className="text-sm text-gray-500 mt-1">Across all departments</p>
          </div>

          <div 
            onClick={() => handleStatusClick("completed")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Completed</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalMetrics.completed}</p>
            <p className="text-sm text-gray-500 mt-1">{completionRate}% completion rate</p>
          </div>

          <div 
            onClick={() => handleStatusClick("inProgress")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">In Progress</span>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CogIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">{totalMetrics.inProgress}</p>
            <p className="text-sm text-gray-500 mt-1">Active items</p>
          </div>

          <div 
            onClick={() => handleStatusClick("pending")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Pending</span>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{totalMetrics.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
          </div>
        </div>

        {/* Department Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Performance Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {departmentSummaries.map((dept) => {
              const deptData = [
                { name: "Completed", value: dept.metrics.completed, color: "#10b981" },
                { name: "In Progress", value: dept.metrics.inProgress, color: "#f59e0b" },
                { name: "Pending", value: dept.metrics.pending, color: "#ef4444" },
              ].filter(item => item.value > 0); // Only show segments with values
              
              const Icon = dept.icon;
              const total = dept.metrics.total;
              
              return (
                <div key={dept.name} className="flex flex-col items-center">
                  <div className="relative">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={deptData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {deptData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center icon and count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`w-10 h-10 ${dept.bgColor} rounded-full flex items-center justify-center mb-1`}>
                        <Icon className={`w-5 h-5 ${dept.color}`} />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{total}</span>
                      <span className="text-xs text-gray-500">Tasks</span>
                    </div>
                  </div>
                  {/* Department name */}
                  <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">{dept.name}</h3>
                  {/* Legend */}
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Completed: {dept.metrics.completed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-gray-600">In Progress: {dept.metrics.inProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-600">Pending: {dept.metrics.pending}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Cards Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentSummaries.map((dept) => {
            const Icon = dept.icon;
            const completionPercentage = dept.metrics.total > 0
              ? ((dept.metrics.completed / dept.metrics.total) * 100).toFixed(0)
              : "0";

            return (
              <div
                key={dept.name}
                onClick={() => router.push(dept.link)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Department Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${dept.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${dept.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {dept.metrics.trend >= 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-semibold ${dept.metrics.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {dept.metrics.trend}%
                    </span>
                  </div>
                </div>

                {/* Department Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">{dept.name}</h3>

                {/* Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="text-lg font-bold text-gray-900">{dept.metrics.total}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Completion</span>
                      <span className="text-xs font-semibold text-gray-700">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-linear-to-r ${dept.color.replace('text', 'from')} to-blue-400 transition-all`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Done</p>
                      <p className="text-sm font-bold text-green-600">{dept.metrics.completed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Active</p>
                      <p className="text-sm font-bold text-amber-600">{dept.metrics.inProgress}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-sm font-bold text-red-600">{dept.metrics.pending}</p>
                    </div>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className={`text-sm font-medium ${dept.color} group-hover:underline flex items-center gap-1`}>
                    View Details
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchAllDepartmentData}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Status Details Modal */}
      {isModalOpen && selectedStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedStatus === "completed" && "Completed Tasks"}
                      {selectedStatus === "inProgress" && "In Progress Tasks"}
                      {selectedStatus === "pending" && "Pending Tasks"}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Complete task list with search and filter capabilities
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by department, task name, or status..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {getTasksByStatus(selectedStatus).filter(task => 
                    task.department.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    task.task.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                    task.status.toLowerCase().includes(modalSearchTerm.toLowerCase())
                  ).length} of {getTasksByStatus(selectedStatus).length} tasks match your search
                </p>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Task Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTasksByStatus(selectedStatus)
                      .filter(task => 
                        task.department.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                        task.task.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                        task.status.toLowerCase().includes(modalSearchTerm.toLowerCase())
                      ).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 px-4 text-center text-sm text-gray-500">
                          No tasks found matching your search
                        </td>
                      </tr>
                    ) : (
                      getTasksByStatus(selectedStatus)
                        .filter(task => 
                          task.department.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                          task.task.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                          task.status.toLowerCase().includes(modalSearchTerm.toLowerCase())
                        )
                        .map((task, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {task.department}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {task.task}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                selectedStatus === "completed" 
                                  ? "bg-green-100 text-green-800" 
                                  : selectedStatus === "inProgress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}>
                                {task.status}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{getTasksByStatus(selectedStatus).length}</span> tasks | Filtered: <span className="font-semibold">
                    {getTasksByStatus(selectedStatus).filter(task => 
                      task.department.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                      task.task.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                      task.status.toLowerCase().includes(modalSearchTerm.toLowerCase())
                    ).length}
                  </span>
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

