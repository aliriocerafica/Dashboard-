"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  HomeIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import {
  logout,
  getCurrentUsername,
  setCurrentUsername,
  isAdmin,
  initializeAdminUser,
} from "../lib/auth";
import { useAuth } from "../lib/useAuth";

export default function Sidebar() {
  const { username, isAdminUser, isLoading: authLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessesOpen, setIsProcessesOpen] = useState(true);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize admin user data in the background
    // This doesn't need to block the sidebar rendering
    const initAdmin = async () => {
      initializeAdminUser();
    };
    initAdmin();
  }, []);

  // Mouse tracking effect - optimized with throttling
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        if (navRef.current) {
          const navLinks = navRef.current.querySelectorAll(".nav-mouse-follow");
          navLinks.forEach((link) => {
            const rect = link.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            (link as HTMLElement).style.setProperty("--mouse-x", `${x}%`);
            (link as HTMLElement).style.setProperty("--mouse-y", `${y}%`);
          });
        }
        throttleTimeout = null as any;
      }, 16); // ~60fps throttling
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  // Update main content margin when sidebar collapses
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        mainContent.style.marginLeft = "0";
      } else if (isSidebarCollapsed) {
        mainContent.style.marginLeft = "4rem"; // 64px = w-16
      } else {
        const isLargeScreen = window.innerWidth >= 1024;
        mainContent.style.marginLeft = isLargeScreen ? "20rem" : "16rem"; // 320px or 256px
      }
    }
  }, [isSidebarCollapsed]);

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    window.location.href = "/home"; // Redirect to home page which will show login
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const departments = useMemo(
    () => [
      {
        name: "Sales",
        href: "/sales",
        icon: ChartBarIcon,
        description: "Sales pipeline and leads",
        color: "bg-blue-50 text-blue-600",
      },
      {
        name: "Marketing",
        href: "/marketing",
        icon: MegaphoneIcon,
        description: "Campaigns and analytics",
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        name: "Finance",
        href: "/finance",
        icon: CurrencyDollarIcon,
        description: "Revenue and expenses",
        color: "bg-amber-50 text-amber-600",
      },
      {
        name: "HR",
        href: "/hr",
        icon: UserGroupIcon,
        description: "Employee management",
        color: "bg-blue-50 text-blue-600",
      },
      {
        name: "Operations",
        href: "/operations",
        icon: CogIcon,
        description: "Process management",
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        name: "IT",
        href: "/it",
        icon: ComputerDesktopIcon,
        description: "Infrastructure and systems",
        color: "bg-purple-50 text-purple-600",
      },
      {
        name: "Office of the President",
        href: "/president",
        icon: BuildingOffice2Icon,
        description: "WIG Dashboard & Executive",
        color: "bg-purple-50 text-purple-600",
      },
    ],
    []
  );

  // Show loading state while initializing (with shorter timeout)
  if (authLoading) {
    return (
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 md:w-64 lg:w-80">
        <div className="relative flex flex-col bg-white/95 border-r border-gray-200 shadow-sm backdrop-blur-sm h-full">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        data-sidebar="true"
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 transition-all duration-300 ${
          isSidebarCollapsed ? "md:w-16 lg:w-16" : "md:w-64 lg:w-80"
        }`}
      >
        <div className="relative flex flex-col bg-white/95 border-r border-gray-200 shadow-sm backdrop-blur-sm h-full">
          {/* Logo Section with Collapse Button */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed
                ? "justify-center px-4 py-4"
                : "justify-between px-6 py-4"
            }`}
          >
            <Link
              href="/"
              className={`flex items-center hover:opacity-80 transition-opacity duration-200 ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300">
                <Image
                  src="/Logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-xs text-gray-500">Business Intelligence</p>
                </div>
              )}
            </Link>

            {/* Collapse/Expand Button - Floating on Edge */}
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-4 top-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl z-10"
                title="Collapse Sidebar"
              >
                <svg
                  className="w-4 h-4 text-gray-600 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Collapse Button for Collapsed State */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-4 top-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl z-10"
              title="Expand Sidebar"
            >
              <svg
                className="w-4 h-4 text-gray-600 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Navigation Section */}
          <div
            ref={navRef}
            className={`flex-1 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[calc(100vh-200px)] ${
              isSidebarCollapsed ? "px-2" : "px-4"
            }`}
          >
            {/* Home Link */}
            <Link
              href="/home"
              className={`nav-mouse-follow flex items-center text-sm font-medium text-gray-700 bg-transparent hover:text-blue-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                isSidebarCollapsed
                  ? "justify-center px-2 py-3"
                  : "gap-3 px-4 py-3"
              }`}
              title={isSidebarCollapsed ? "Home" : ""}
            >
              <HomeIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {!isSidebarCollapsed && (
                <span className="relative z-10">Home</span>
              )}
            </Link>

            {/* Documentation Link */}
            <Link
              href="/documentation"
              className={`nav-mouse-follow flex items-center text-sm font-medium text-gray-700 bg-transparent hover:text-emerald-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                isSidebarCollapsed
                  ? "justify-center px-2 py-3"
                  : "gap-3 px-4 py-3"
              }`}
              title={isSidebarCollapsed ? "Documentation" : ""}
            >
              <DocumentTextIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {!isSidebarCollapsed && (
                <span className="relative z-10">Documentation</span>
              )}
            </Link>

            {/* Processes Section */}
            <div className="pt-4">
              {!isSidebarCollapsed ? (
                <button
                  onClick={() => setIsProcessesOpen(!isProcessesOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Processes</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isProcessesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/forms"
                    className={`nav-mouse-follow flex items-center text-sm font-medium text-gray-700 bg-transparent hover:text-orange-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isSidebarCollapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-4 py-3"
                    }`}
                    title={isSidebarCollapsed ? "Forms" : ""}
                  >
                    <DocumentTextIcon className="w-5 h-5 transition-transform duration-300" />
                    {!isSidebarCollapsed && (
                      <span className="relative z-10">Forms</span>
                    )}
                  </Link>
                  <Link
                    href="/admin/it-requests"
                    className={`nav-mouse-follow flex items-center text-sm font-medium text-gray-700 bg-transparent hover:text-purple-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isSidebarCollapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-4 py-3"
                    }`}
                    title={isSidebarCollapsed ? "Manage Request" : ""}
                  >
                    <CogIcon className="w-5 h-5 transition-transform duration-300" />
                    {!isSidebarCollapsed && (
                      <span className="relative z-10">Manage Request</span>
                    )}
                  </Link>
                  {isAdminUser && (
                    <Link
                      href="/admin/user-management"
                      className={`nav-mouse-follow flex items-center text-sm font-medium text-gray-700 bg-transparent hover:text-indigo-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                        isSidebarCollapsed
                          ? "justify-center px-2 py-3"
                          : "gap-3 px-4 py-3"
                      }`}
                      title={isSidebarCollapsed ? "User Management" : ""}
                    >
                      <UserGroupIcon className="w-5 h-5 transition-transform duration-300" />
                      {!isSidebarCollapsed && (
                        <span className="relative z-10">User Management</span>
                      )}
                    </Link>
                  )}
                </div>
              )}
              {isProcessesOpen && !isSidebarCollapsed && (
                <div className="space-y-1 mt-2">
                  <Link
                    href="/forms"
                    className="nav-mouse-follow flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-orange-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <DocumentTextIcon className="w-5 h-5 transition-transform duration-300" />
                    <span className="relative z-10">Forms</span>
                  </Link>
                  <Link
                    href="/admin/it-requests"
                    className="nav-mouse-follow flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-purple-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <CogIcon className="w-5 h-5 transition-transform duration-300" />
                    <span className="relative z-10">Manage Request</span>
                  </Link>
                  {isAdminUser && (
                    <Link
                      href="/admin/user-management"
                      className="nav-mouse-follow flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-indigo-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <UserGroupIcon className="w-5 h-5 transition-transform duration-300" />
                      <span className="relative z-10">User Management</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Departments Section */}
            <div className="pt-4">
              {!isSidebarCollapsed ? (
                <button
                  onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>Departments</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDepartmentsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <div className="flex justify-center px-2 py-2">
                  <BuildingOffice2Icon
                    className="w-5 h-5 text-gray-500"
                    title="Departments"
                  />
                </div>
              )}
              {isDepartmentsOpen && !isSidebarCollapsed && (
                <div className="space-y-1 mt-2">
                  {departments.map((dept) => {
                    const IconComponent = dept.icon;
                    return (
                      <Link
                        key={dept.name}
                        href={dept.href}
                        className="nav-mouse-follow flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-blue-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 group"
                        title={isSidebarCollapsed ? dept.name : ""}
                      >
                        <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        <span className="relative z-10">{dept.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Departments Icons for Collapsed State */}
            {isSidebarCollapsed && (
              <div className="space-y-1">
                {departments.map((dept) => {
                  const IconComponent = dept.icon;
                  return (
                    <Link
                      key={dept.name}
                      href={dept.href}
                      className="nav-mouse-follow flex items-center justify-center px-2 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-blue-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 group"
                      title={dept.name}
                    >
                      <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-shrink-0 h-4"></div>

          {/* User Section */}
          <div
            className={`flex-shrink-0 mt-6 ${
              isSidebarCollapsed ? "p-2" : "p-4"
            }`}
          >
            {!isSidebarCollapsed ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 mb-4 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {username}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {isAdminUser ? "Admin" : "User"}
                    </div>
                  </div>
                </Link>

                {/* User Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleLogout}
                    className="nav-sliding-bg w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-transparent hover:text-red-600 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-left"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform duration-300" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                {/* Settings Button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="User Menu"
                >
                  <CogIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Menu Dropdown */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]">
            {/* User Info - Clickable to Profile */}
            <div className="px-4 py-3 border-b border-gray-100">
              <Link
                href="/profile"
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {username}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {isAdminUser ? "Admin" : "User"}
                  </div>
                </div>
              </Link>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white/95 backdrop-blur-sm hover:bg-gray-100 rounded-lg transition-all shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <Link
                  href="/"
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image
                      src="/Logo.png"
                      alt="Logo"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Dashboard
                    </h1>
                    <p className="text-xs text-gray-500">
                      Business Intelligence
                    </p>
                  </div>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {/* Home Link */}
                <Link
                  href="/home"
                  className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="relative z-10">Home</span>
                </Link>

                {/* Documentation Link */}
                <Link
                  href="/documentation"
                  className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-emerald-600 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span className="relative z-10">Documentation</span>
                </Link>

                {/* Processes Section */}
                <div className="pt-4">
                  <button
                    onClick={() => setIsProcessesOpen(!isProcessesOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Processes</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isProcessesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isProcessesOpen && (
                    <div className="space-y-1 mt-2">
                      <Link
                        href="/forms"
                        className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span className="relative z-10">Forms</span>
                      </Link>
                      <Link
                        href="/admin/it-requests"
                        className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <CogIcon className="w-5 h-5" />
                        <span className="relative z-10">Manage Request</span>
                      </Link>
                      {isAdminUser && (
                        <Link
                          href="/admin/user-management"
                          className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-lg transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserGroupIcon className="w-5 h-5" />
                          <span className="relative z-10">User Management</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Departments Section */}
                <div className="pt-4">
                  <button
                    onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>Departments</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDepartmentsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isDepartmentsOpen && (
                    <div className="space-y-1 mt-2">
                      {departments.map((dept) => {
                        const IconComponent = dept.icon;
                        return (
                          <Link
                            key={dept.name}
                            href={dept.href}
                            className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="relative z-10">{dept.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile User Section */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {username}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {isAdminUser ? "Admin" : "User"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="nav-sliding-bg flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="relative z-10">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="nav-sliding-bg w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-600 rounded-lg transition-all text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-start p-4 animate-in fade-in duration-200 overflow-y-auto"
          style={{ zIndex: 9999, paddingTop: "120px" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in scale-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Logout
              </h2>
            </div>

            {/* Message */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to log out? You will need to log in again to
              access the dashboard.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
