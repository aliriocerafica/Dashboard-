"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

interface EmployeeBonusData {
  employeeId: string;
  name: string;
  account: string;
  dateHired: string;
  requiredWeeks: number;
  attendanceWeeks: number;
  paidLeaves: number;
  qualifiedForPerfectPresence: boolean;
  attendanceBonusPerQtr: number;
  attendanceBonusPerWk: number;
  perfectPresenceAward: number;
  attendanceRelatedBonus: number;
  onsiteWfh: string;
  clientSatisfaction: number;
  teamContinuity: number;
  supervisorAward: number;
  totalQuarterlyBonus: number;
  status: string;
  weeklyAttendance: Array<{ week: string; present: boolean }>;
}

export default function EmployeePortalPage() {
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeBonusData | null>(
    null
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PIN layout: 4 boxes, dash, 3 boxes => 7 digits total (example: 2029-001)
  const LEFT_PIN_LENGTH = 4;
  const RIGHT_PIN_LENGTH = 3;
  const TOTAL_PIN_LENGTH = LEFT_PIN_LENGTH + RIGHT_PIN_LENGTH;

  const prevUnlockedRef = useRef(false);

  // Function to fetch employee data
  const fetchEmployeeData = async (employeePin: string, showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true);
      }

      // Format PIN to include dash (e.g., "2025001" -> "2025-001")
      const formattedPin = `${employeePin.slice(0, 4)}-${employeePin.slice(4)}`;

      // Fetch employee bonus data from API
      const res = await fetch(
        `/api/get-employee-bonus?id=${encodeURIComponent(formattedPin)}`
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Employee not found");
      }

      setEmployeeData(result.data);
      setLastUpdated(new Date());
      if (showLoading) {
        setIsUnlocked(true);
      }
    } catch (err) {
      if (showLoading) {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't verify that Employee ID. Please check and try again."
        );
        setIsUnlocked(false);
        setEmployeeData(null);
      }
      throw err;
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic front‑end validation
    if (pin.trim().length !== TOTAL_PIN_LENGTH) {
      setError("Please enter your 7‑digit PIN in the format 2029-001.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchEmployeeData(pin.trim(), true);
    } catch (err) {
      // Error already handled in fetchEmployeeData
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-refresh every 30 seconds when employee data is loaded
  useEffect(() => {
    if (!employeeData || !isUnlocked) return;

    // Extract employee ID from the data (format: "2025-001")
    const employeeId = employeeData.employeeId.replace(/-/g, "");

    const interval = setInterval(() => {
      fetchEmployeeData(employeeId, false).catch(() => {
        // Silently fail on auto-refresh to avoid disrupting user experience
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [employeeData, isUnlocked]);

  // Trigger confetti when unlocked
  useEffect(() => {
    if (isUnlocked && !prevUnlockedRef.current) {
      // Confetti configuration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      prevUnlockedRef.current = true;
    }

    if (!isUnlocked) {
      prevUnlockedRef.current = false;
    }
  }, [isUnlocked]);

  return (
    <main className="min-h-screen bg-[#dc2626] text-slate-900 flex justify-center items-start px-4 pt-2 sm:pt-3 pb-8 sm:pb-12 relative overflow-hidden">
      {/* Background SVG Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/PortalBG2.svg"
          alt=""
          fill
          className="object-cover object-bottom sm:object-right"
          priority
          aria-hidden="true"
          sizes="100vw"
        />
      </div>

      {/* Gradient Circle Overlay */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(255, 245, 245, 0.4) 0%, rgba(255, 255, 255, 0) 50%)",
        }}
      />

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative z-10">
        {/* Content container */}
        <div className="w-full max-w-2xl pt-2 sm:pt-3 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-2 sm:mb-3">
            <Image
              src="/Ardent.png"
              alt="Ardent Employee Portal"
              width={280}
              height={84}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              priority
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full">
            {!isUnlocked ? (
              <>
                {/* Header */}
                <div className="text-center mb-2 sm:mb-3">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">
                    <span className="text-[#b9030c]">Employee </span>
                    <span className="text-slate-900">Bonus Profile</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed mb-0.5 px-2">
                    To access your Bonuses Profile, please enter your Employee
                    ID number below.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed px-2">
                    This keeps your bonus information secure and ensures only
                    you can view your Bonus Profile.
                  </p>
                </div>

                {/* PIN Input Section */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6 max-w-xl mx-auto"
                >
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-900 text-center mb-4 sm:mb-6 px-2">
                      4 digits, dash, then 3 digits (example: 2029-001).
                    </p>

                    {/* Hidden input to capture keyboard input */}
                    <input
                      id="pin"
                      type="tel"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={TOTAL_PIN_LENGTH}
                      className="sr-only"
                      value={pin}
                      onChange={(e) => {
                        const numeric = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, TOTAL_PIN_LENGTH);
                        setPin(numeric);
                      }}
                    />

                    {/* Visible PIN boxes */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-center py-6 sm:py-8 focus:outline-none"
                      onClick={() => {
                        const input = document.getElementById(
                          "pin"
                        ) as HTMLInputElement | null;
                        input?.focus();
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                        {/* Left side: 4 boxes */}
                        {Array.from({ length: LEFT_PIN_LENGTH }).map(
                          (_, index) => {
                            const digitIndex = index;
                            const valueChar = pin[digitIndex];
                            const isActive = digitIndex === pin.length;

                            return (
                              <div
                                key={`left-${index}`}
                                className={`h-12 w-10 sm:h-16 sm:w-14 rounded-md bg-gray-100 flex items-center justify-center text-xl sm:text-2xl font-semibold text-slate-900 border-b-4 ${
                                  isActive && pin.length < TOTAL_PIN_LENGTH
                                    ? "border-[#b9030c]"
                                    : "border-gray-300"
                                }`}
                              >
                                {valueChar ?? ""}
                              </div>
                            );
                          }
                        )}

                        {/* Dash separator */}
                        <div className="px-1 sm:px-2 text-[#b9030c] text-2xl sm:text-3xl font-bold">
                          -
                        </div>

                        {/* Right side: 3 boxes */}
                        {Array.from({ length: RIGHT_PIN_LENGTH }).map(
                          (_, index) => {
                            const digitIndex = LEFT_PIN_LENGTH + index;
                            const valueChar = pin[digitIndex];
                            const isActive = digitIndex === pin.length;

                            return (
                              <div
                                key={`right-${index}`}
                                className={`h-12 w-10 sm:h-16 sm:w-14 rounded-md bg-gray-100 flex items-center justify-center text-xl sm:text-2xl font-semibold text-slate-900 border-b-4 ${
                                  isActive && pin.length < TOTAL_PIN_LENGTH
                                    ? "border-[#b9030c]"
                                    : "border-gray-300"
                                }`}
                              >
                                {valueChar ?? ""}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </button>
                  </div>

                  {error && (
                    <p className="text-[10px] sm:text-xs text-[#b9030c] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-2 text-center">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-center px-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center px-16 sm:px-24 py-3 rounded-none bg-white text-[#b9030c] font-semibold text-xs sm:text-sm uppercase tracking-wide shadow-md hover:bg-gray-50 hover:shadow-lg transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto max-w-md"
                    >
                      {isSubmitting ? "Verifying..." : "OPEN"}
                    </button>
                  </div>
                </form>
              </>
            ) : employeeData ? (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Close Button and Refresh - Top */}
                <div className="flex justify-between items-center mb-4">
                  {lastUpdated && (
                    <p className="text-xs text-slate-500">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const employeeId = employeeData.employeeId.replace(
                            /-/g,
                            ""
                          );
                          await fetchEmployeeData(employeeId, false);
                        } catch (err) {
                          // Error handled silently
                        }
                      }}
                      disabled={isRefreshing}
                      className="bg-white hover:bg-gray-50 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 shadow-sm hover:shadow transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh"
                    >
                      {isRefreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUnlocked(false);
                        setPin("");
                        setError(null);
                        setEmployeeData(null);
                        setLastUpdated(null);
                      }}
                      className="bg-white hover:bg-gray-50 text-slate-700 font-semibold px-4 py-2 rounded-md border border-slate-300 shadow-sm hover:shadow transition text-sm"
                      aria-label="Close"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    <span className="text-[#b9030c]">Welcome, </span>
                    <span className="text-slate-900">{employeeData.name}</span>
                  </h2>
                  <p className="text-sm text-slate-600">
                    Employee ID: {employeeData.employeeId} | Account:{" "}
                    {employeeData.account} | Status: {employeeData.status}
                  </p>
                </div>

                {/* Total Bonus Card */}
                <div className="bg-white rounded-xl border-2 border-[#b9030c] shadow-lg p-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">
                      Total Quarterly Bonus
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-[#b9030c]">
                      ₱
                      {employeeData.totalQuarterlyBonus.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Bonus Breakdown Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">
                      Attendance Bonus (Qtr)
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      ₱
                      {employeeData.attendanceBonusPerQtr.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">
                      Attendance Bonus (Per Week)
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      ₱
                      {employeeData.attendanceBonusPerWk.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">
                      Perfect Presence Award
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      ₱
                      {employeeData.perfectPresenceAward.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                    {employeeData.qualifiedForPerfectPresence && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Qualified ✓
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs text-slate-500 mb-1">
                      Attendance-Related Bonus
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      ₱
                      {employeeData.attendanceRelatedBonus.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  {employeeData.clientSatisfaction > 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">
                        Client Satisfaction
                      </p>
                      <p className="text-xl font-semibold text-slate-900">
                        ₱
                        {employeeData.clientSatisfaction.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {employeeData.teamContinuity > 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">
                        Team Continuity
                      </p>
                      <p className="text-xl font-semibold text-slate-900">
                        ₱
                        {employeeData.teamContinuity.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}

                  {employeeData.supervisorAward > 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">
                        Supervisor Award
                      </p>
                      <p className="text-xl font-semibold text-slate-900">
                        ₱
                        {employeeData.supervisorAward.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Attendance Summary */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Attendance Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Weeks Present</p>
                      <p className="text-2xl font-bold text-[#b9030c]">
                        {employeeData.attendanceWeeks}
                      </p>
                      <p className="text-xs text-slate-500">
                        of {employeeData.requiredWeeks} required
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid Leaves</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {employeeData.paidLeaves}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Onsite/WFH</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {employeeData.onsiteWfh || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date Hired</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {employeeData.dateHired}
                      </p>
                    </div>
                  </div>

                  {/* Weekly Attendance Grid */}
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">
                      Weekly Attendance
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {employeeData.weeklyAttendance.map((week, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-center ${
                            week.present
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <p className="text-[10px] font-medium">{week.week}</p>
                          <p className="text-xs font-bold mt-1">
                            {week.present ? "✓" : "✗"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-xl mx-auto text-center">
                <h2 className="text-2xl font-semibold">Loading...</h2>
                <p className="text-sm text-slate-600">
                  Fetching your bonus profile...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
