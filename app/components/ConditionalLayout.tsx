"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../lib/useAuth";
import { clearAllAuthData } from "../lib/auth";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const { authenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  // Quick check for immediate redirect on protected pages
  const isProtectedPage = [
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
  ].includes(pathname);

  // Pages that should never show sidebar
  const noSidebarPages = ["/splash", "/login"];

  // Check if current page requires authentication
  const requiresAuth = isProtectedPage;

  // Check if current page should show sidebar
  const shouldShowSidebar = authenticated && !noSidebarPages.includes(pathname);

  // Redirect to login if not authenticated and trying to access protected page
  useEffect(() => {
    if (!isLoading && requiresAuth && !authenticated) {
      // Add a small delay to prevent rapid redirects
      const redirectTimer = setTimeout(() => {
        router.push("/login");
        setRedirectAttempts((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(redirectTimer);
    }
  }, [authenticated, isLoading, requiresAuth, router, pathname]);

  // Recovery mechanism for stuck authentication
  useEffect(() => {
    if (redirectAttempts > 5) {
      // Clear all auth data and force refresh
      clearAllAuthData();
      window.location.reload();
    }
  }, [redirectAttempts]);

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
        <div className="text-center">
          <LoadingSpinner size="lg" text="Redirecting to login..." />
          <p className="mt-4 text-sm text-gray-600">
            Please wait while we redirect you to the login page.
          </p>
          {redirectAttempts > 2 && (
            <button
              onClick={() => {
                clearAllAuthData();
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Auth Data & Reload
            </button>
          )}
        </div>
      </div>
    );
  }

  // If sidebar should be shown, use sidebar layout
  if (shouldShowSidebar) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main
          className="flex-1 md:ml-64 lg:ml-80 overflow-y-auto transition-all duration-300 pt-16 md:pt-0"
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
