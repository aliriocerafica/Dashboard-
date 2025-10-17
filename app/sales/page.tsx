'use client';

import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import StatsCards from '../components/StatsCards';
import SummaryCards from '../components/SummaryCards';
import Charts from '../components/Charts';
import DataTable from '../components/DataTable';
import LoginForm from '../components/LoginForm';
import ProgressStats from '../components/ProgressStats';
import { fetchSheetData, calculateStats, SalesData, DashboardStats } from '../lib/sheets';
import { isAuthenticated, setAuthenticated } from '../lib/auth';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1_sQb1x5vGjUtxTegjCLyDFi3MgfaG_hxu0x7rxXyArI/edit?gid=0#gid=0';

export default function SalesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    readyToEngage: 0,
    developQualify: 0,
    unqualified: 0,
    averageScore: 0,
    topSource: '',
  });
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheetData = await fetchSheetData(GOOGLE_SHEET_URL);
      setData(sheetData);
      setStats(calculateStats(sheetData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales Dashboard</h1>
            <p className="text-sm text-gray-600">Track and manage your sales pipeline and leads</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadData}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Row 1: KPI tiles (4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <StatsCards stats={stats} />
        </div>

        {/* Row 2: Progress Stats */}
        <div className="mb-4">
          <ProgressStats data={data} />
        </div>

        {/* Row 3: Lead Sources + Weekly summary */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          {/* Lead Sources */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Lead Sources</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(data.reduce((acc, item) => {
                  if (item.source) acc[item.source] = (acc[item.source] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).map(([source, count], i) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{source}</span>
                    <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Summary tile */}
          <div>
            <SummaryCards stats={stats} data={data} />
          </div>
        </div>

        {/* Row 3: Recent leads + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
              <button className="text-blue-600 text-xs font-medium">SEE ALL</button>
            </div>
            <div className="space-y-3">
              {data.slice(0, 6).map((item, index) => {
                const colors = ['bg-blue-600','bg-emerald-600','bg-purple-600','bg-orange-600','bg-rose-600','bg-indigo-600'];
                const initials = item.contactPerson ? item.contactPerson.split(' ').map(n=>n[0]).join('').toUpperCase() : 'N/A';
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>{initials}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.firmName}</div>
                      <div className="text-xs text-gray-500 truncate">{item.fitLevel}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">{item.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
