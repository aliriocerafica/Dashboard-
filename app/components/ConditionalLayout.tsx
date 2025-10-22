"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const router = useRouter();

  // Pages that should never show sidebar
  const noSidebarPages = ["/splash", "/login"];

  // Pages that require authentication
  const protectedPages = [
    "/sales",
    "/marketing",
    "/finance",
    "/hr",
    "/operations",
    "/it",
    "/president",
    "/admin",
    "/profile",
    "/home",
  ];

  // Check if current page requires authentication
  const requiresAuth = protectedPages.includes(pathname);

  // Check if current page should show sidebar
  const shouldShowSidebar = authenticated && !noSidebarPages.includes(pathname);

  // Redirect to splash if not authenticated and trying to access protected page
  useEffect(() => {
    if (!isLoading && requiresAuth && !authenticated) {
      router.push("/splash");
    }
  }, [authenticated, isLoading, requiresAuth, router, pathname]);

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // If trying to access protected page without auth, show loading while redirecting
  if (requiresAuth && !authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting to login..." />
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
