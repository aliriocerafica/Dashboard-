"use client";

import { useEffect, useMemo, useState } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

// A "moving task" style loader: three checklist rows cycle while loading
export default function LoadingSpinner({
  size = "md",
  text = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 650);
    return () => clearInterval(id);
  }, []);

  const dims = useMemo(
    () =>
      ({
        sm: { rowW: 140, rowH: 6, icon: 14, font: "text-xs" },
        md: { rowW: 200, rowH: 8, icon: 16, font: "text-sm" },
        lg: { rowW: 260, rowH: 10, icon: 18, font: "text-base" },
      }[size]),
    [size]
  );

  const rows = [
    { label: "Preparing data" },
    { label: "Fetching from Sheets" },
    { label: "Rendering" },
  ];

  // During SSR (before hydration), render a simple deterministic placeholder
  if (!hydrated) {
    const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" } as const;
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
        />
        {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const width = isActive ? 0.75 : isDone ? 1 : 0.35; // percentage of bar
          return (
            <div key={row.label} className="flex items-center gap-2">
              {/* icon */}
              <svg
                width={dims.icon}
                height={dims.icon}
                viewBox="0 0 24 24"
                className={`transition-colors ${
                  isDone
                    ? "text-emerald-600"
                    : isActive
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.15} />
                <path
                  d="M9.5 12.5l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* progress bar */}
              <div
                className="rounded-full bg-gray-200 overflow-hidden"
                style={{ width: dims.rowW, height: dims.rowH }}
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    isDone
                      ? "bg-emerald-500"
                      : isActive
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                  style={{ width: `${Math.round(width * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {text && <p className={`mt-3 ${dims.font} text-gray-600`}>{text}</p>}
    </div>
  );
}
