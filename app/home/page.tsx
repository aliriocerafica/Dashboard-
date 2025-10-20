'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '../components/Topbar';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  MegaphoneIcon,
  CurrencyDollarIcon, 
  UserGroupIcon,
  CogIcon,
  ArrowRightIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { isAuthenticated } from '../lib/auth';
import LoginForm from '../components/LoginForm';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const departments = [
    {
      name: 'Sales',
      href: '/sales',
      icon: ChartBarIcon,
      description: 'Sales pipeline and lead management',
      color: 'from-blue-500 to-blue-600',
      stats: 'Active Pipeline'
    },
    {
      name: 'Marketing',
      href: '/marketing',
      icon: MegaphoneIcon,
      description: 'Campaigns and customer analytics',
      color: 'from-emerald-500 to-emerald-600',
      stats: 'Active Campaigns'
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: CurrencyDollarIcon,
      description: 'Revenue tracking and financial reports',
      color: 'from-amber-500 to-amber-600',
      stats: 'Revenue Growth'
    },
    {
      name: 'HR',
      href: '/hr',
      icon: UserGroupIcon,
      description: 'Employee management and performance',
      color: 'from-blue-500 to-blue-600',
      stats: 'Team Performance'
    },
    {
      name: 'Operations',
      href: '/operations',
      icon: CogIcon,
      description: 'Process optimization and efficiency',
      color: 'from-emerald-500 to-emerald-600',
      stats: 'Process Metrics'
    },
    {
      name: 'IT',
      href: '/it',
      icon: ComputerDesktopIcon,
      description: 'Infrastructure and system management',
      color: 'from-purple-500 to-purple-600',
      stats: 'System Status'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Business Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access real-time analytics and insights across all departments. 
            Choose a department below to view its dedicated dashboard.
          </p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Link
              key={dept.name}
              href={dept.href}
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <dept.icon className="w-8 h-8" />
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{dept.name}</h3>
              <p className="text-gray-600 mb-4">{dept.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{dept.stats}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                  View Dashboard →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
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

