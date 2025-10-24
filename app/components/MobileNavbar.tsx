"use client";

import { useState, useEffect } from "react";
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
  MagnifyingGlassIcon,
  ShoppingCartIcon,
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

  // Close modal when pathname changes (navigation)
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile-only bottom navigation bar with new design */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="rounded-t-3xl mx-2 shadow-2xl"
          style={{
            backgroundColor: "#ff6d74",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center justify-around px-4 py-3">
            {/* Home */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-full transition-all duration-200 ${
                isActive("/")
                  ? "bg-white text-gray-800 shadow-lg"
                  : "text-white hover:text-gray-200"
              }`}
            >
              <HomeIcon className="w-5 h-5" />
            </Link>

            {/* Search */}
            <Link
              href="/search"
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-full transition-all duration-200 ${
                isActive("/search")
                  ? "bg-white text-gray-800 shadow-lg"
                  : "text-white hover:text-gray-200"
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Link>

            {/* Departments Dropup */}
            <div className="relative">
              <button
                onClick={toggleExpanded}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-full transition-all duration-200 ${
                  isExpanded
                    ? "bg-white text-gray-800 shadow-lg"
                    : "text-white hover:text-gray-200"
                }`}
              >
                <BuildingOfficeIcon className="w-5 h-5" />
              </button>

              {/* Dropup Menu */}
              {isExpanded && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  onClick={() => setIsExpanded(false)}
                >
                  <div
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-80 max-w-[calc(100vw-2rem)] mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                              ? "bg-blue-100 text-blue-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() => setIsExpanded(false)}
                        >
                          <dept.icon className={`w-5 h-5 mr-3 ${dept.color}`} />
                          <span className="text-sm font-medium">
                            {dept.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-full transition-all duration-200 ${
                isActive("/profile")
                  ? "bg-white text-gray-800 shadow-lg"
                  : "text-white hover:text-gray-200"
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          </div>
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
