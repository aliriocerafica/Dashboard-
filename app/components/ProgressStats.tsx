'use client';

import { SalesData } from '../lib/sheets';
import { ChartBarIcon, TrophyIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ProgressStatsProps {
  data: SalesData[];
}

export default function ProgressStats({ data }: ProgressStatsProps) {
  // Get week number from date
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  // Calculate current week data
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  const currentWeekData = data.filter(item => {
    try {
      const itemDate = new Date(item.date);
      return getWeekNumber(itemDate) === currentWeek && itemDate.getFullYear() === currentYear;
    } catch {
      return false;
    }
  });

  // Calculate metrics for current week
  const totalLeads = data.length;
  const weeklyLeads = currentWeekData.length;
  const weeklyReadyToEngage = currentWeekData.filter(item => item.fitLevel === 'Ready to Engage').length;
  const weeklyHighScoreLeads = currentWeekData.filter(item => item.score >= 70).length;

  // Weekly Goals (you can customize these)
  const weeklyGoal = 12;
  const conversionGoal = 8;
  const qualityGoal = 10;

  // Calculate percentages
  const weeklyProgress = Math.min((weeklyLeads / weeklyGoal) * 100, 100);
  const conversionProgress = Math.min((weeklyReadyToEngage / conversionGoal) * 100, 100);
  const qualityProgress = Math.min((weeklyHighScoreLeads / qualityGoal) * 100, 100);

  const progressBars = [
    {
      label: 'Weekly Leads Goal',
      current: weeklyLeads,
      goal: weeklyGoal,
      percentage: weeklyProgress,
      color: 'blue',
      icon: CalendarIcon,
      description: 'This week',
    },
    {
      label: 'Weekly Conversion Goal',
      current: weeklyReadyToEngage,
      goal: conversionGoal,
      percentage: conversionProgress,
      color: 'emerald',
      icon: TrophyIcon,
      description: 'Ready to engage',
    },
    {
      label: 'Weekly Quality Goal',
      current: weeklyHighScoreLeads,
      goal: qualityGoal,
      percentage: qualityProgress,
      color: 'amber',
      icon: ChartBarIcon,
      description: 'Score ≥ 70',
    },
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
      },
      amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        border: 'border-amber-200',
      },
    };
    return colors[color]?.[type] || colors.blue[type];
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <ChartBarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
          <p className="text-xs text-gray-500">Track your performance against targets</p>
        </div>
      </div>

      <div className="space-y-6">
        {progressBars.map((item, index) => {
          const Icon = item.icon;
          const isComplete = item.percentage >= 100;
          
          return (
            <div key={index} className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${getColorClasses(item.color, 'text')}`} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {item.current}<span className="text-sm text-gray-400">/{item.goal}</span>
                  </div>
                  <div className={`text-xs font-semibold ${isComplete ? 'text-emerald-600' : getColorClasses(item.color, 'text')}`}>
                    {item.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getColorClasses(item.color, 'bg')} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>

              {/* Status badge */}
              {isComplete && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Goal Reached!</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {progressBars.filter(p => p.percentage >= 100).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Goals Achieved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((progressBars.reduce((sum, p) => sum + p.percentage, 0) / progressBars.length)).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg. Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {totalLeads}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}

