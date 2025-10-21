'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { logout, getCurrentUsername, setCurrentUsername } from '../lib/auth';

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessesOpen, setIsProcessesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [username, setUsername] = useState<string>('admin');

  useEffect(() => {
    // Get username from session or use default
    const storedUsername = getCurrentUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Set default username
      setCurrentUsername('admin');
      setUsername('admin');
    }
  }, []);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    window.location.href = '/home'; // Redirect to home page which will show login
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const departments = [
    { 
      name: 'Sales', 
      href: '/sales', 
      icon: ChartBarIcon, 
      description: 'Sales pipeline and leads',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'Marketing', 
      href: '/marketing', 
      icon: MegaphoneIcon, 
      description: 'Campaigns and analytics',
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      name: 'Finance', 
      href: '/finance', 
      icon: CurrencyDollarIcon, 
      description: 'Revenue and expenses',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      name: 'HR', 
      href: '/hr', 
      icon: UserGroupIcon, 
      description: 'Employee management',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'Operations', 
      href: '/operations', 
      icon: CogIcon, 
      description: 'Process management',
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      name: 'IT', 
      href: '/it', 
      icon: ComputerDesktopIcon, 
      description: 'Infrastructure and systems',
      color: 'bg-purple-50 text-purple-600'
    },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-10 h-10 bg-[#ff6d74] rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500">Business Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/home"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
              style={{
                perspective: '1000px'
              }}
            >
              <HomeIcon className="w-5 h-5 transition-transform duration-300" />
              <span>Home</span>
            </Link>
            
            <Link
              href="/documentation"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
            >
              <DocumentTextIcon className="w-5 h-5 transition-transform duration-300" />
              <span>Documentation</span>
            </Link>

            {/* Processes Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProcessesOpen(!isProcessesOpen);
                  setIsDropdownOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-transparent hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 border border-transparent hover:border-orange-200"
              >
                <DocumentTextIcon className="w-5 h-5 transition-transform duration-300" />
                <span className="text-sm font-medium">Processes</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-all duration-300 ${isProcessesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Processes Dropdown Menu */}
              {isProcessesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Processes</h3>
                    <p className="text-xs text-gray-500">Manage company processes</p>
                  </div>
                  <Link
                    href="/forms"
                    className="flex items-center space-x-3 px-4 py-3 mx-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group"
                    onClick={() => setIsProcessesOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center transition-all duration-300 group-hover:scale-120 group-hover:shadow-lg">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Forms</div>
                      <div className="text-xs text-gray-500">Submit requests</div>
                    </div>
                  </Link>
                  <Link
                    href="/admin/it-requests"
                    className="flex items-center space-x-3 px-4 py-3 mx-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group"
                    onClick={() => setIsProcessesOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center transition-all duration-300 group-hover:scale-120 group-hover:shadow-lg">
                      <CogIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Manage Request</div>
                      <div className="text-xs text-gray-500">Admin panel</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsProcessesOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-gray-700 hover:text-purple-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 border border-transparent hover:border-purple-200"
              >
                <span className="text-sm font-medium">Departments</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Select Department</h3>
                  <p className="text-xs text-gray-500">Choose a department to view its dashboard</p>
                </div>
                <div className="py-2">
                  {departments.map((dept) => {
                    const IconComponent = dept.icon;
                    return (
                      <Link
                        key={dept.name}
                        href={dept.href}
                        className="flex items-center space-x-3 px-4 py-3 mx-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-lg ${dept.color} flex items-center justify-center transition-all duration-300 group-hover:scale-120 group-hover:shadow-lg`}>
                          <IconComponent className="w-5 h-5 transition-transform duration-300" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-950">{dept.name}</div>
                          <div className="text-xs text-gray-500 group-hover:text-gray-600">{dept.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            </div>

            {/* Profile Button */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-transparent hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 border border-transparent hover:border-indigo-200"
              title="Profile Settings"
            >
              <UserCircleIcon className="w-5 h-5 transition-transform duration-300" />
              <span>Profile</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-transparent hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 border border-transparent hover:border-red-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-2">
            {/* Home Link */}
            <Link
              href="/home"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {/* Documentation Link */}
            <Link
              href="/documentation"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Documentation</span>
            </Link>

            {/* Processes Section */}
            <div className="border-t border-gray-100 pt-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Processes</div>
              <Link
                href="/forms"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Forms</span>
              </Link>
              <Link
                href="/admin/it-requests"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CogIcon className="w-5 h-5" />
                <span>Manage Request</span>
              </Link>
            </div>

            {/* Departments Section */}
            <div className="border-t border-gray-100 pt-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Departments</div>
              {departments.map((dept) => {
                const IconComponent = dept.icon;
                return (
                  <Link
                    key={dept.name}
                    href={dept.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{dept.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="border-t border-gray-100 pt-2 space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-start justify-center p-4 pt-32 animate-in fade-in duration-200 overflow-y-auto"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in scale-in duration-200 my-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Logout</h2>
            </div>

            {/* Message */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to log out? You will need to log in again to access the dashboard.
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
    </nav>
  );
}
