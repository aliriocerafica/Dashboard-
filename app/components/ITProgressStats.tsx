// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import { ITData } from '../lib/sheets';
import { TicketIcon, CheckCircleIcon, ClockIcon, CalendarIcon, ChevronDownIcon, StarIcon } from '@heroicons/react/24/outline';

interface ITProgressStatsProps {
  data: ITData[];
}

interface WeekOption {
  week: number;
  year: number;
  label: string;
  isCurrent: boolean;
}

export default function ITProgressStats({ data }: ITProgressStatsProps) {
  // Get week number from date
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
  };

  // Get current week info
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  // Get all available weeks from data
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<string>();
    
    // Always add the current week, even if no tickets exist
    weeksSet.add(`${currentYear}-${currentWeek}`);
    
    // Add weeks from existing data
    data.forEach(item => {
      try {
        const itemDate = new Date(item.timestamp);
        if (isNaN(itemDate.getTime())) return;
        const week = getWeekNumber(itemDate);
        const year = itemDate.getFullYear();
        weeksSet.add(`${year}-${week}`);
      } catch {
        // Skip invalid dates
      }
    });

    const weeks: WeekOption[] = Array.from(weeksSet)
      .map(weekStr => {
        const [year, week] = weekStr.split('-').map(Number);
        const isCurrent = week === currentWeek && year === currentYear;
        return {
          week,
          year,
          label: isCurrent ? `Week ${week}, ${year} (Current)` : `Week ${week}, ${year}`,
          isCurrent,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.week - a.week;
      });

    return weeks;
  }, [data, currentWeek, currentYear]);

  // State for selected week
  const [selectedWeek, setSelectedWeek] = useState<WeekOption>(
    availableWeeks.find(w => w.isCurrent) || availableWeeks[0] || { week: currentWeek, year: currentYear, label: `Week ${currentWeek}, ${currentYear} (Current)`, isCurrent: true }
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter data for selected week
  const selectedWeekData = useMemo(() => {
    return data.filter(item => {
      try {
        const itemDate = new Date(item.timestamp);
        if (isNaN(itemDate.getTime())) return false;
        return getWeekNumber(itemDate) === selectedWeek.week && itemDate.getFullYear() === selectedWeek.year;
      } catch {
        return false;
      }
    });
  }, [data, selectedWeek]);

  // Parse time string to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    
    let totalSeconds = 0;
    const minutesMatch = timeStr.match(/(\d+)m/);
    const secondsMatch = timeStr.match(/(\d+)s/);
    const hoursMatch = timeStr.match(/(\d+)h/);
    
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
    if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
    if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
    
    return totalSeconds;
  };

  // Format seconds to readable time
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (secs > 0 || result === '') result += `${secs}s`;
    
    return result.trim();
  };

  // Calculate metrics for selected week
  const weeklyTickets = selectedWeekData.length;
  const weeklyResolvedTickets = selectedWeekData.filter(item => 
    item.status?.toLowerCase() === 'resolved' || 
    item.isProblemSolved?.toLowerCase() === 'yes'
  ).length;

  console.log(`Week ${selectedWeek.week}, ${selectedWeek.year}:`, {
    totalWeeklyTickets: weeklyTickets,
    resolvedTickets: weeklyResolvedTickets,
    sampleTicket: selectedWeekData[0] ? {
      timestamp: selectedWeekData[0].timestamp,
      status: selectedWeekData[0].status,
      timeResolved: selectedWeekData[0].timeResolved,
      calculatedResolutionTime: selectedWeekData[0].calculatedResolutionTime,
    } : 'No tickets'
  });

  // Calculate average resolution time for the week
  // Total Time / Number of Resolved Tickets = Avg Resolution Time
  // Use calculatedResolutionTime (Column M) which has the Apps Script calculated time
  const resolvedTicketsWithTime = selectedWeekData.filter(item => {
    const isResolved = item.status?.toLowerCase() === 'resolved' || item.isProblemSolved?.toLowerCase() === 'yes';
    const hasTime = (item.calculatedResolutionTime && item.calculatedResolutionTime.trim() !== '') || 
                    (item.timeResolved && item.timeResolved.trim() !== '');
    return isResolved && hasTime;
  });
  
  console.log(`Week ${selectedWeek.week}: ${resolvedTicketsWithTime.length} tickets with time out of ${weeklyResolvedTickets} resolved`);
  
  const resolutionTimesInSeconds = resolvedTicketsWithTime.map(item => {
    // Prefer calculatedResolutionTime (Column M) over timeResolved (Column J)
    const timeStr = item.calculatedResolutionTime && item.calculatedResolutionTime.trim() !== ''
      ? item.calculatedResolutionTime
      : item.timeResolved;
    
    const seconds = parseTimeToSeconds(timeStr);
    if (seconds === 0) {
      console.log(`⚠️ Could not parse time: "${timeStr}" for ticket at ${item.timestamp}`);
    } else {
      console.log(`✓ Parsed: "${timeStr}" = ${seconds}s (${formatTime(seconds)})`);
    }
    return seconds;
  }).filter(time => time > 0); // Only count valid times
  
  const totalResolutionSeconds = resolutionTimesInSeconds.reduce((sum, time) => sum + time, 0);
  
  const avgResolutionSeconds = resolutionTimesInSeconds.length > 0
    ? Math.round(totalResolutionSeconds / resolutionTimesInSeconds.length)
    : 0;
  const weeklyAvgResolutionTime = avgResolutionSeconds > 0 ? formatTime(avgResolutionSeconds) : '0s';
  
  console.log(`✓ Week ${selectedWeek.week} Avg Resolution Time: ${resolutionTimesInSeconds.length} tickets, Total: ${formatTime(totalResolutionSeconds)}, Avg: ${weeklyAvgResolutionTime}`);

  // Calculate satisfaction rate for the week
  const weeklyResponses = selectedWeekData.filter(item => item.response).length;
  const weeklySatisfied = selectedWeekData.filter(item => 
    item.response?.toLowerCase().includes('satisfied')
  ).length;
  const weeklySatisfactionRate = weeklyResponses > 0 
    ? Math.round((weeklySatisfied / weeklyResponses) * 1000) / 10 
    : 0;

  // Weekly goal: 10 tickets resolved per week
  const weeklyGoal = 10;
  const weeklyProgress = Math.min((weeklyResolvedTickets / weeklyGoal) * 100, 100);

  const progressBars = [
    {
      label: 'Weekly Resolved Tickets',
      current: weeklyResolvedTickets,
      goal: weeklyGoal,
      percentage: weeklyProgress,
      color: 'purple',
      icon: CheckCircleIcon,
      description: selectedWeek.isCurrent ? 'This week' : `Week ${selectedWeek.week}, ${selectedWeek.year}`,
      showGoal: false,
      showOver: false,
      showProgressBar: false,
    },
    {
      label: 'Weekly Avg Resolution Time',
      current: weeklyAvgResolutionTime,
      goal: 0,
      percentage: 0,
      color: 'blue',
      icon: ClockIcon,
      description: resolutionTimesInSeconds.length > 0 
        ? `Total time / ${resolutionTimesInSeconds.length} tickets` 
        : weeklyResolvedTickets > 0 
          ? 'No time data available'
          : 'No tickets this week',
      showGoal: false,
      showOver: false,
      showProgressBar: false,
    },
    {
      label: 'Weekly Satisfaction Rate',
      current: `${weeklySatisfactionRate}%`,
      goal: 100,
      percentage: weeklySatisfactionRate,
      color: 'emerald',
      icon: StarIcon,
      description: weeklyResponses > 0 ? 'Customer satisfaction' : 'No responses this week',
      showGoal: false,
      showOver: false,
      showProgressBar: true,
    },
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
      },
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
    };
    return colors[color]?.[type] || colors.purple[type];
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <TicketIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Report</h3>
            <p className="text-xs text-gray-500">Track weekly performance metrics</p>
          </div>
        </div>
        
        {/* Week Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{selectedWeek.label}</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                {availableWeeks.length > 0 ? (
                  availableWeeks.map((week) => (
                    <button
                      key={`${week.year}-${week.week}`}
                      onClick={() => {
                        setSelectedWeek(week);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center justify-between ${
                        selectedWeek.week === week.week && selectedWeek.year === week.year
                          ? 'bg-purple-50 text-purple-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{week.label}</span>
                      {week.isCurrent && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          Current
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No weeks available</div>
                )}
              </div>
            </>
          )}
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
                    {typeof item.current === 'string' ? item.current : item.current}
                    {item.showGoal && item.showOver && <span className="text-sm text-gray-400"> over /{item.goal}</span>}
                    {item.showGoal && !item.showOver && <span className="text-sm text-gray-400">/{item.goal}</span>}
                  </div>
                  {item.showGoal && (
                    <div className={`text-xs font-semibold ${isComplete ? 'text-emerald-600' : getColorClasses(item.color, 'text')}`}>
                      {item.percentage.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {item.showProgressBar && (
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClasses(item.color, 'bg')} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Status badge */}
              {isComplete && item.showProgressBar && (
                <div className="flex justify-end mt-2">
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
              {weeklyResolvedTickets}
            </div>
            <div className="text-xs text-gray-500 mt-1">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {weeklyTickets - weeklyResolvedTickets}
            </div>
            <div className="text-xs text-gray-500 mt-1">Unresolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {weeklyTickets}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Tickets</div>
          </div>
        </div>
      </div>
    </div>
  );
}

