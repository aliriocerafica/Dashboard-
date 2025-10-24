"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../lib/auth";

interface Department {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}

const departments: Department[] = [
  {
    name: "Sales",
    href: "/sales",
    icon: ChartBarIcon,
    color: "text-blue-600",
  },
  {
    name: "Marketing",
    href: "/marketing",
    icon: BuildingOfficeIcon,
    color: "text-green-600",
  },
  {
    name: "Finance",
    href: "/finance",
    icon: CurrencyDollarIcon,
    color: "text-emerald-600",
  },
  {
    name: "HR",
    href: "/hr",
    icon: UserGroupIcon,
    color: "text-purple-600",
  },
  {
    name: "Operations",
    href: "/operations",
    icon: CogIcon,
    color: "text-orange-600",
  },
  {
    name: "IT",
    href: "/it",
    icon: ShieldCheckIcon,
    color: "text-indigo-600",
  },
  {
    name: "President",
    href: "/president",
    icon: BuildingOfficeIcon,
    color: "text-red-600",
  },
];

export default function MobileNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile-only bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive("/")
                ? "bg-purple-100 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>

          {/* Departments Dropup */}
          <div className="relative">
            <button
              onClick={toggleExpanded}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isExpanded
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BuildingOfficeIcon className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Departments</span>
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 mt-1" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 mt-1" />
              )}
            </button>

            {/* Dropup Menu */}
            {isExpanded && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 max-w-[calc(100vw-2rem)]">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    Departments
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {departments.map((dept) => (
                      <Link
                        key={dept.name}
                        href={dept.href}
                        className={`flex items-center p-3 rounded-xl transition-colors ${
                          isActive(dept.href)
                            ? "bg-purple-100 text-purple-600"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                        onClick={() => setIsExpanded(false)}
                      >
                        <dept.icon className={`w-5 h-5 mr-3 ${dept.color}`} />
                        <span className="text-sm font-medium">{dept.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile with pure blur effect */}
      {isExpanded && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
