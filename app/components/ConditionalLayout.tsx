"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { isAuthenticated } from "../lib/auth";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setShowSidebar(authenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Pages that should never show sidebar
  const noSidebarPages = ["/splash"];

  // Check if current page should show sidebar
  const shouldShowSidebar = showSidebar && !noSidebarPages.includes(pathname);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // If sidebar should be shown, use sidebar layout
  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main
          className="flex-1 md:ml-64 lg:ml-80 overflow-y-auto transition-all duration-300"
          id="main-content"
        >
          {children}
        </main>
      </div>
    );
  }

  // Otherwise, show content without sidebar
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
