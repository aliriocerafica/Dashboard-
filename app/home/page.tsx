"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChartBarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import {
  isAuthenticated,
  initializeAdminUser,
  isAdmin,
  getCurrentUsername,
  setCurrentUsername,
} from "../lib/auth";
import LoginForm from "../components/LoginForm";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const router = useRouter();

  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    if (authenticated) {
      const username = getCurrentUsername();
      if (username) {
        setIsAdminUser(isAdmin(username));
      }
    }
  }, []);

  // Handle ESC key to close zoom modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomModalOpen) {
        setIsZoomModalOpen(false);
        setZoomLevel(100);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isZoomModalOpen]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const departments = [
    {
      name: "Sales",
      href: "/sales",
      icon: ChartBarIcon,
      description: "Sales pipeline and lead management",
      color: "from-blue-500 to-blue-600",
      stats: "Active Pipeline",
    },
    {
      name: "Marketing",
      href: "/marketing",
      icon: MegaphoneIcon,
      description: "Campaigns and customer analytics",
      color: "from-emerald-500 to-emerald-600",
      stats: "Active Campaigns",
    },
    {
      name: "Finance",
      href: "/finance",
      icon: CurrencyDollarIcon,
      description: "Revenue tracking and financial reports",
      color: "from-amber-500 to-amber-600",
      stats: "Revenue Growth",
    },
    {
      name: "HR",
      href: "/hr",
      icon: UserGroupIcon,
      description: "Employee management and performance",
      color: "from-blue-500 to-blue-600",
      stats: "Team Performance",
    },
    {
      name: "Operations",
      href: "/operations",
      icon: CogIcon,
      description: "Process optimization and efficiency",
      color: "from-emerald-500 to-emerald-600",
      stats: "Process Metrics",
    },
    {
      name: "IT",
      href: "/it",
      icon: ComputerDesktopIcon,
      description: "Infrastructure and system management",
      color: "from-purple-500 to-purple-600",
      stats: "System Status",
    },
    {
      name: "Office of the President",
      href: "/president",
      icon: BuildingOffice2Icon,
      description: "Executive initiatives and strategic planning",
      color: "from-red-500 to-red-600",
      stats: "Executive Overview",
    },
    {
      name: "DPO",
      href: "/dpo",
      icon: ShieldCheckIcon,
      description: "Data privacy oversight and compliance",
      color: "from-blue-500 to-blue-600",
      stats: "Privacy Metrics",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="text-center sm:text-start mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome to Dashboard For All
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto sm:mx-0 mb-4 sm:mb-6">
            Access real-time analytics and insights across all departments.
            Choose a department below to view its dedicated dashboard.
          </p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {departments.map((dept, index) => (
            <Link
              key={dept.name}
              href={dept.href}
              className="group flowing-hover bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out rounded-2xl" />

              {/* Content with relative positioning */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`icon-float w-16 h-16 bg-linear-to-br ${dept.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ease-in-out`}
                    style={{
                      transitionDelay: `${index * 50 + 100}ms`,
                    }}
                  >
                    <dept.icon className="w-8 h-8 transition-transform duration-300" />
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-500 ease-in-out" />
                </div>

                <h3 className="text-glow text-2xl font-bold text-gray-900 mb-2 transition-colors duration-300">
                  {dept.name}
                </h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {dept.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    {dept.stats}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 group-hover:font-bold transition-all duration-300">
                    View Dashboard →
                  </span>
                </div>
              </div>

              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-500 ease-in-out" />
            </Link>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-6">
            <InformationCircleIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              How It Works
            </h2>
          </div>
          <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-3xl">
            Our dashboard system connects seamlessly with Google Sheets to provide
            real-time data visualization and analytics. Here's how the system works:
          </p>

          {/* SVG Image Container */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200 mb-8 overflow-hidden">
            <div 
              className="relative w-full aspect-video bg-gray-50 rounded-lg flex items-center justify-center p-4 cursor-pointer group hover:bg-gray-100 transition-all duration-300"
              onClick={() => setIsZoomModalOpen(true)}
            >
              <img
                src="/HowITworks.svg"
                alt="How the Dashboard System Works"
                className="w-full h-full object-contain max-h-[600px] transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay with zoom icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg flex items-center justify-center transition-all duration-300">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <ArrowsPointingOutIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              {/* Hint text */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                Click to zoom
              </div>
            </div>
          </div>

          {/* Highlighted Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900">Data Source</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Google Sheets serve as the central data repository. Each department
                maintains their own sheets with real-time updates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900">API Integration</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Our system fetches data from published Google Sheets via CSV URLs,
                ensuring automatic synchronization without manual exports.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200 hover:border-green-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900">Data Processing</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Data is parsed, transformed, and processed to calculate metrics,
                statistics, and generate insights for each department.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900">Visualization</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Interactive charts, graphs, and tables display the processed data
                in an intuitive, easy-to-understand format.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-200 hover:border-red-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <h3 className="text-lg font-bold text-gray-900">Real-time Updates</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Users can refresh data on-demand to get the latest information
                from Google Sheets, ensuring always up-to-date dashboards.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <h3 className="text-lg font-bold text-gray-900">Secure Access</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Role-based authentication ensures that only authorized users can
                access department-specific dashboards and data.
              </p>
            </div>
          </div>
        </div>

        {/* Zoom Modal */}
        {isZoomModalOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsZoomModalOpen(false);
                setZoomLevel(100);
              }
            }}
          >
            <div className="flex min-h-screen items-center justify-center p-4">
              <div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      How It Works - Detailed View
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Zoom in/out to explore the system workflow
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsZoomModalOpen(false);
                      setZoomLevel(100);
                    }}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
                      Zoom Out
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-600 rotate-180" />
                      Zoom In
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Use mouse wheel or pinch to zoom • Drag to pan
                  </div>
                </div>

                {/* Zoomable Image Container */}
                <div className="flex-1 overflow-auto bg-gray-100 p-8">
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      cursor: zoomLevel > 100 ? 'grab' : 'default',
                      userSelect: 'none',
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -10 : 10;
                      setZoomLevel(Math.max(50, Math.min(200, zoomLevel + delta)));
                    }}
                  >
                    <div
                      className="bg-white rounded-lg shadow-2xl p-8 transition-transform duration-300"
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'center',
                      }}
                    >
                      <img
                        src="/HowITworks.svg"
                        alt="How the Dashboard System Works - Zoomed View"
                        className="max-w-full h-auto select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Click outside or press ESC to close
                  </p>
                  <button
                    onClick={() => {
                      setIsZoomModalOpen(false);
                      setZoomLevel(100);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">Real-time Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Secure Access</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">∞</div>
              <div className="text-sm text-gray-600">Scalable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
