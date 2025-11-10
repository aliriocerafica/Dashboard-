"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { isAuthenticated } from "../lib/auth";
import LoginForm from "../components/LoginForm";
import LoadingSpinner from "../components/LoadingSpinner";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "dashboard" | "data" | "commitment" | "concern" | "ticket";
  href: string;
  department?: string;
  status?: string;
  date?: string;
  score?: number;
}

export default function SearchPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Mock data for search results
  const mockData: SearchResult[] = [
    // Dashboard results
    {
      id: "president-dashboard",
      title: "President Dashboard",
      description: "WIG tracking and performance metrics for Office of the President",
      type: "dashboard",
      href: "/president",
      department: "Office of the President",
    },
    {
      id: "finance-dashboard",
      title: "Finance Dashboard",
      description: "Payroll concerns and financial management",
      type: "dashboard",
      href: "/finance",
      department: "Finance",
    },
    {
      id: "sales-dashboard",
      title: "Sales Dashboard",
      description: "Sales pipeline and lead management",
      type: "dashboard",
      href: "/sales",
      department: "Sales",
    },
    {
      id: "it-dashboard",
      title: "IT Dashboard",
      description: "IT ticket management and system status",
      type: "dashboard",
      href: "/it",
      department: "IT",
    },
    // WIG Commitments
    {
      id: "wig-1",
      title: "Monthly Cash Flow Forecasting",
      description: "Submit to the President, monthly cash flow forecasting that covers at least three (3) upcoming payroll and bonus cycles.",
      type: "commitment",
      href: "/president",
      department: "Office of the Vice President for Finance",
      status: "Completed",
      date: "10/13/2025",
    },
    {
      id: "wig-2",
      title: "Weekly WIG Sessions",
      description: "Attend weekly WIG sessions presided by the CEO; and, in his absence, to preside the WIG sessions.",
      type: "commitment",
      href: "/president",
      department: "Office of the President",
      status: "Completed",
      date: "9/29/2025",
    },
    {
      id: "wig-3",
      title: "Daily Cleaning Checks",
      description: "Conduct daily cleaning and orderliness checks of all office spaces, with issues corrected within the same day.",
      type: "commitment",
      href: "/president",
      department: "Office of the President",
      status: "In Progress",
      date: "10/24/2025",
    },
    // Payroll Concerns
    {
      id: "payroll-1",
      title: "Referral Bonus Issue",
      description: "On September 10, 2025, Tristan became a regular employee, but I haven't received the referral bonus yet.",
      type: "concern",
      href: "/finance",
      department: "Finance",
      status: "Resolved",
      date: "10/17/2025",
    },
    {
      id: "payroll-2",
      title: "Salary Release Schedule",
      description: "I strongly suggest a fixed, or at the very least, announced schedule for the release of salary.",
      type: "concern",
      href: "/finance",
      department: "Finance",
      status: "Resolved",
      date: "10/20/2025",
    },
    // IT Tickets
    {
      id: "ticket-1",
      title: "Laptop Setup Request",
      description: "New employee laptop setup and software installation",
      type: "ticket",
      href: "/it",
      department: "IT",
      status: "Resolved",
      date: "10/15/2025",
    },
    {
      id: "ticket-2",
      title: "Email Access Issue",
      description: "Unable to access company email account",
      type: "ticket",
      href: "/it",
      department: "IT",
      status: "In Progress",
      date: "10/22/2025",
    },
  ];

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtered = mockData.filter(item => 
      item.title.toLowerCase().includes(term.toLowerCase()) ||
      item.description.toLowerCase().includes(term.toLowerCase()) ||
      item.department?.toLowerCase().includes(term.toLowerCase()) ||
      item.status?.toLowerCase().includes(term.toLowerCase())
    );

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dashboard":
        return <ChartBarIcon className="w-5 h-5" />;
      case "commitment":
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case "concern":
        return <CurrencyDollarIcon className="w-5 h-5" />;
      case "ticket":
        return <ShieldCheckIcon className="w-5 h-5" />;
      default:
        return <MagnifyingGlassIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "dashboard":
        return "bg-blue-100 text-blue-600";
      case "commitment":
        return "bg-green-100 text-green-600";
      case "concern":
        return "bg-yellow-100 text-yellow-600";
      case "ticket":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredResults = selectedFilter === "all" 
    ? searchResults 
    : searchResults.filter(result => result.type === selectedFilter);

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <MagnifyingGlassIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Search Dashboard
              </h1>
              <p className="text-gray-600">
                Find dashboards, commitments, concerns, and tickets
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all dashboards, commitments, and data..."
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filter Tabs */}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({searchResults.length})
              </button>
              <button
                onClick={() => setSelectedFilter("dashboard")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Dashboards ({searchResults.filter(r => r.type === "dashboard").length})
              </button>
              <button
                onClick={() => setSelectedFilter("commitment")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === "commitment"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Commitments ({searchResults.filter(r => r.type === "commitment").length})
              </button>
              <button
                onClick={() => setSelectedFilter("concern")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === "concern"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Concerns ({searchResults.filter(r => r.type === "concern").length})
              </button>
              <button
                onClick={() => setSelectedFilter("ticket")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === "ticket"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Tickets ({searchResults.filter(r => r.type === "ticket").length})
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {isSearching && (
            <div className="text-center py-8">
              <LoadingSpinner size="md" text="Searching..." />
            </div>
          )}

          {!isSearching && searchTerm && filteredResults.length === 0 && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try searching with different keywords or check your spelling.
              </p>
            </div>
          )}

          {!isSearching && !searchTerm && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-gray-600">
                Enter a search term to find dashboards, commitments, concerns, and tickets.
              </p>
            </div>
          )}

          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(result.href)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {result.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                    {result.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {result.department && (
                      <span className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        {result.department}
                      </span>
                    )}
                    {result.date && (
                      <span>{result.date}</span>
                    )}
                    {result.score && (
                      <span>Score: {result.score}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {!searchTerm && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/president")}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <BuildingOfficeIcon className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">President</span>
              </button>
              <button
                onClick={() => router.push("/finance")}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CurrencyDollarIcon className="w-8 h-8 text-emerald-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Finance</span>
              </button>
              <button
                onClick={() => router.push("/sales")}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <ChartBarIcon className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Sales</span>
              </button>
              <button
                onClick={() => router.push("/it")}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <ShieldCheckIcon className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">IT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
