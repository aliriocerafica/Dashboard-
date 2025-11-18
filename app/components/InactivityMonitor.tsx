"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "../lib/auth";
import {
  resetInactivityTimer,
  clearInactivityTimer,
  INACTIVITY_TIMEOUT,
} from "../lib/inactivity";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function InactivityMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  // Pages that don't require authentication (shouldn't trigger inactivity)
  const publicPages = ["/", "/splash", "/login", "/how-it-works"];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    // Don't monitor on public pages
    if (isPublicPage) return;

    const handleWarning = () => {
      setShowWarning(true);
      setRemainingSeconds(60);
    };

    const handleLogout = () => {
      logout();
      router.push("/home");
    };

    // Setup activity listeners with throttling
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    let activityThrottle: NodeJS.Timeout;

    const handleActivity = () => {
      if (activityThrottle) return;

      activityThrottle = setTimeout(() => {
        setShowWarning(false);
        resetInactivityTimer(handleWarning, handleLogout);
        activityThrottle = null as any;
      }, 1000); // Throttle activity detection to once per second
    };

    // Initial setup
    resetInactivityTimer(handleWarning, handleLogout);

    // Add event listeners with passive option for better performance
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, {
        passive: true,
        capture: true,
      });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, {
          capture: true,
        });
      });
      clearInactivityTimer();
      if (activityThrottle) clearTimeout(activityThrottle);
    };
  }, [pathname, router, isPublicPage]);

  // Update countdown timer
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          logout();
          router.push("/home");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [showWarning, router]);

  if (isPublicPage || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-linear-to-r from-amber-50 to-orange-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-0.5">
                <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Session Timeout Warning
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  You will be logged out due to inactivity
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">Your session will expire in:</p>
              <div className="bg-linear-to-r from-amber-100 to-orange-100 rounded-lg p-4 text-center">
                <div className="text-4xl font-bold text-amber-600 font-mono">
                  {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
                  {String(remainingSeconds % 60).padStart(2, "0")}
                </div>
                <p className="text-sm text-amber-700 mt-2">seconds remaining</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> Click anywhere on the page to stay
                logged in and reset the timer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  logout();
                  router.push("/home");
                }}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <XMarkIcon className="w-5 h-5" />
                  Logout Now
                </div>
              </button>
              <button
                onClick={() => {
                  // Reset warning state immediately
                  setShowWarning(false);
                  setRemainingSeconds(60);
                  
                  // Reset the inactivity timer
                  resetInactivityTimer(
                    () => {
                      setShowWarning(true);
                      setRemainingSeconds(60);
                    },
                    () => {
                      logout();
                      router.push("/home");
                    }
                  );
                }}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Stay Logged In
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <p className="text-xs text-gray-500 text-center">
              Last activity was 14 minutes ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
