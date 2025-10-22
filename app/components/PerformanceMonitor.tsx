"use client";

import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development and only when needed
    if (process.env.NODE_ENV !== "development") return;

    // Skip performance monitoring to reduce overhead
    return;

    // Monitor sidebar loading time
    const startTime = performance.now();

    const checkSidebarLoaded = () => {
      const sidebar = document.querySelector('[data-sidebar="true"]');
      if (sidebar) {
        const loadTime = performance.now() - startTime;
        console.log(`🚀 Sidebar loaded in: ${loadTime.toFixed(2)}ms`);
      } else {
        // Check again in 100ms
        setTimeout(checkSidebarLoaded, 100);
      }
    };

    // Start monitoring after a short delay
    setTimeout(checkSidebarLoaded, 100);

    // Monitor auth state changes
    const monitorAuthChanges = () => {
      console.log("🔐 Auth state changed at:", new Date().toISOString());
    };

    window.addEventListener("auth-change", monitorAuthChanges);

    return () => {
      window.removeEventListener("auth-change", monitorAuthChanges);
    };
  }, []);

  return null; // This component doesn't render anything
}
