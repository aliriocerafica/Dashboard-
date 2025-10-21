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
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-start mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Dashboard For All
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-6">
            Access real-time analytics and insights across all departments.
            Choose a department below to view its dedicated dashboard.
          </p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <Link
              key={dept.name}
              href={dept.href}
              className="group flowing-hover bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative overflow-hidden"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out rounded-2xl" />

              {/* Content with relative positioning */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`icon-float w-16 h-16 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ease-in-out`}
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
