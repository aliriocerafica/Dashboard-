"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../lib/useAuth";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const { authenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Pages that should never show sidebar
  const noSidebarPages = ["/splash"];

  // Check if current page should show sidebar
  const shouldShowSidebar = authenticated && !noSidebarPages.includes(pathname);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
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
