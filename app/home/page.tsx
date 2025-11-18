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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {departments.map((dept, index) => (
            <Link
              key={dept.name}
              href={dept.href}
              className="group block"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-4 sm:p-5 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                {/* Background gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br ${dept.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <dept.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-300">
                    {dept.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">
                    {dept.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                      {dept.stats}
                    </span>
                    <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                      Open
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>


        {/* Quick Stats */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
            Quick Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md p-4 sm:p-5 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">8</div>
              <div className="text-xs sm:text-sm text-white/90 font-medium">Departments</div>
            </div>
            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-md p-4 sm:p-5 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-white/90 font-medium">Real-time Data</div>
            </div>
            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-md p-4 sm:p-5 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-xs sm:text-sm text-white/90 font-medium">Secure Access</div>
            </div>
            <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-md p-4 sm:p-5 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">∞</div>
              <div className="text-xs sm:text-sm text-white/90 font-medium">Scalable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
