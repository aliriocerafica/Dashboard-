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
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { logout, getCurrentUsername, setCurrentUsername } from '../lib/auth';

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    logout();
    window.location.href = '/home'; // Redirect to home page which will show login
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

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
              style={{
                perspective: '1000px'
              }}
            >
              <HomeIcon className="w-5 h-5 transition-transform duration-300" />
              <span className="hidden md:inline">Home</span>
            </Link>
            
            <Link
              href="/documentation"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-transparent hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
            >
              <DocumentTextIcon className="w-5 h-5 transition-transform duration-300" />
              <span className="hidden md:inline">Documentation</span>
            </Link>

            {/* Department Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
              <span className="hidden md:inline">Profile</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-transparent hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95 border border-transparent hover:border-red-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform duration-300" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
