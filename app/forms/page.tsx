'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '../components/Topbar';
import LoginForm from '../components/LoginForm';
import { isAuthenticated, setAuthenticated } from '../lib/auth';
import { 
  ArrowRightIcon, 
  DocumentIcon,
  CheckCircleIcon,
  PaperClipIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FormsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  const forms = [
    {
      id: 1,
      title: 'IT Asset Request',
      description: 'Request IT equipment and resources needed for your work',
      icon: DocumentIcon,
      href: '/it-asset-request',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'Available',
      submissions: 24,
    },
    {
      id: 2,
      title: 'Leave Request',
      description: 'Submit leave applications and track approval status',
      icon: CheckCircleIcon,
      href: '#',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'Coming Soon',
      submissions: 0,
    },
    {
      id: 3,
      title: 'Expense Report',
      description: 'Submit and track your business expense reimbursements',
      icon: CreditCardIcon,
      href: '#',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      status: 'Coming Soon',
      submissions: 0,
    },
    {
      id: 4,
      title: 'Travel Request',
      description: 'Plan and request approval for business travel',
      icon: PaperClipIcon,
      href: '#',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: 'Coming Soon',
      submissions: 0,
    },
    {
      id: 5,
      title: 'Team Feedback',
      description: 'Provide feedback and suggestions to management',
      icon: UserGroupIcon,
      href: '#',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      status: 'Coming Soon',
      submissions: 0,
    },
    {
      id: 6,
      title: 'Incident Report',
      description: 'Report workplace incidents and safety concerns',
      icon: CheckCircleIcon,
      href: '#',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      status: 'Coming Soon',
      submissions: 0,
    },
  ];

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Forms & Requests</h1>
          <p className="text-lg text-gray-600">Access all company forms and submission tools in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
            <div className="text-sm text-gray-600">Total Forms</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-2">1</div>
            <div className="text-sm text-gray-600">Available Now</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-2">24</div>
            <div className="text-sm text-gray-600">Submissions This Month</div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => {
            const IconComponent = form.icon;
            const isAvailable = form.status === 'Available';

            return (
              <div
                key={form.id}
                className={`${form.bgColor} rounded-2xl border-2 ${form.borderColor} p-6 hover:shadow-lg transition-all duration-300 ${
                  isAvailable ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${form.color} flex items-center justify-center text-white shadow-lg`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        isAvailable
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{form.title}</h3>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{form.description}</p>

                {/* Submissions Count */}
                {isAvailable && (
                  <div className="mb-4 text-xs text-gray-600">
                    📊 {form.submissions} submissions this month
                  </div>
                )}

                {/* Button */}
                {isAvailable ? (
                  <Link
                    href={form.href}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
                  >
                    Open Form
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Select Form</h4>
              <p className="text-sm text-gray-600">Choose the form you need to complete</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fill Details</h4>
              <p className="text-sm text-gray-600">Complete all required fields carefully</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Add Signature</h4>
              <p className="text-sm text-gray-600">Sign digitally to authorize submission</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Submit & Track</h4>
              <p className="text-sm text-gray-600">Get request ID and track status</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help? Contact the HR Department at hr@company.com or ext. 2345</p>
        </div>
      </div>
    </div>
  );
}
