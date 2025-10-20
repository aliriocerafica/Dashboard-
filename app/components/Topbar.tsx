'use client';

import { useState } from 'react';
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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { logout } from '../lib/auth';

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#ff6d74] rounded-xl flex items-center justify-center text-white shadow-lg">
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </Link>
            
            <Link
              href="/documentation"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span className="hidden md:inline">Documentation</span>
            </Link>

            {/* Department Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Departments</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-lg ${dept.color} flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          <div className="text-xs text-gray-500">{dept.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
