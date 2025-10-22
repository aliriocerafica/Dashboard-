"use client";

import { useState, useMemo } from "react";
import { SalesData } from "../lib/sheets";
import {
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ProgressStatsProps {
  data: SalesData[];
}

interface WeekOption {
  week: number;
  year: number;
  label: string;
  isCurrent: boolean;
}

export default function ProgressStats({ data }: ProgressStatsProps) {
  // Get week number from date
  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
  };

  // Get current week info
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  // Get all available weeks from data
  const availableWeeks = useMemo(() => {
    const weeksSet = new Set<string>();
    data.forEach((item) => {
      try {
        const itemDate = new Date(item.date);
        const week = getWeekNumber(itemDate);
        const year = itemDate.getFullYear();
        weeksSet.add(`${year}-${week}`);
      } catch {
        // Skip invalid dates
      }
    });

    const weeks: WeekOption[] = Array.from(weeksSet)
      .map((weekStr) => {
        const [year, week] = weekStr.split("-").map(Number);
        const isCurrent = week === currentWeek && year === currentYear;
        return {
          week,
          year,
          label: isCurrent
            ? `Week ${week}, ${year} (Current)`
            : `Week ${week}, ${year}`,
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
    availableWeeks.find((w) => w.isCurrent) ||
      availableWeeks[0] || {
        week: currentWeek,
        year: currentYear,
        label: `Week ${currentWeek}, ${currentYear} (Current)`,
        isCurrent: true,
      }
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter data for selected week
  const selectedWeekData = useMemo(() => {
    return data.filter((item) => {
      try {
        const itemDate = new Date(item.date);
        return (
          getWeekNumber(itemDate) === selectedWeek.week &&
          itemDate.getFullYear() === selectedWeek.year
        );
      } catch {
        return false;
      }
    });
  }, [data, selectedWeek]);

  // Calculate metrics for selected week
  const totalLeads = data.length;
  const weeklyLeads = selectedWeekData.length;
  const weeklyReadyToEngage = selectedWeekData.filter(
    (item) => item.fitLevel === "Ready to Engage"
  ).length;
  const weeklyHighScoreLeads = selectedWeekData.filter(
    (item) => item.score >= 70
  ).length;

  // Weekly Goals (you can customize these)
  const weeklyGoal = 5;
  const conversionGoal = 8;
  const qualityGoal = 10;

  // Calculate percentages
  const weeklyProgress = Math.min((weeklyLeads / weeklyGoal) * 100, 100);
  const conversionProgress = Math.min(
    (weeklyReadyToEngage / conversionGoal) * 100,
    100
  );
  const qualityProgress = Math.min(
    (weeklyHighScoreLeads / qualityGoal) * 100,
    100
  );

  const progressBars = [
    {
      label: "Weekly Leads Goal",
      current: weeklyLeads,
      goal: weeklyGoal,
      percentage: weeklyProgress,
      color: "blue",
      icon: CalendarIcon,
      description: selectedWeek.isCurrent
        ? "This week"
        : `Week ${selectedWeek.week}, ${selectedWeek.year}`,
      showGoal: true,
      showOver: true,
      showProgressBar: true,
    },
    {
      label: "Weekly Lead Conversion",
      current: weeklyReadyToEngage,
      goal: conversionGoal,
      percentage: conversionProgress,
      color: "emerald",
      icon: TrophyIcon,
      description: "Ready to engage",
      showGoal: false,
      showOver: false,
      showProgressBar: false,
    },
  ];

  const getColorClasses = (color: string, type: "bg" | "text" | "border") => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      emerald: {
        bg: "bg-emerald-500",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
      },
    };
    return colors[color]?.[type] || colors.blue[type];
  };

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Goal Progress
            </h3>
            <p className="text-xs text-gray-500">
              Track your performance against targets
            </p>
          </div>
        </div>

        {/* Week Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-colors border border-blue-200 w-full sm:w-auto"
          >
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{selectedWeek.label}</span>
            <ChevronDownIcon
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
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
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                {availableWeeks.length > 0 ? (
                  availableWeeks.map((week) => (
                    <button
                      key={`${week.year}-${week.week}`}
                      onClick={() => {
                        setSelectedWeek(week);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        selectedWeek.week === week.week &&
                        selectedWeek.year === week.year
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700"
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
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No weeks available
                  </div>
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
                  <Icon
                    className={`w-5 h-5 ${getColorClasses(item.color, "text")}`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {item.current}
                    {item.showGoal && item.showOver && (
                      <span className="text-sm text-gray-400">
                        {" "}
                        over /{item.goal}
                      </span>
                    )}
                    {item.showGoal && !item.showOver && (
                      <span className="text-sm text-gray-400">
                        /{item.goal}
                      </span>
                    )}
                  </div>
                  {item.showGoal && (
                    <div
                      className={`text-xs font-semibold ${
                        isComplete
                          ? "text-emerald-600"
                          : getColorClasses(item.color, "text")
                      }`}
                    >
                      {item.percentage.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {item.showProgressBar && (
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClasses(
                      item.color,
                      "bg"
                    )} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Status badge */}
              {isComplete && item.showProgressBar && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
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
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">
              {progressBars.filter((p) => p.percentage >= 100).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Goals Achieved</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {(
                progressBars.reduce((sum, p) => sum + p.percentage, 0) /
                progressBars.length
              ).toFixed(0)}
              %
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg. Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-emerald-600">
              {totalLeads}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}
