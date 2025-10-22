"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUsername } from "./auth";
import LoadingSpinner from "../components/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  fallback,
  redirectTo = "/splash",
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const username = getCurrentUsername();

      if (!authenticated || !username) {
        // Not authenticated, redirect to login
        router.push(redirectTo);
        return;
      }

      setIsAuth(true);
      setIsLoading(false);
    };

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 10);

    return () => clearTimeout(timer);
  }, [router, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Verifying authentication..." />
        </div>
      )
    );
  }

  if (!isAuth) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Redirecting to login..." />
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: React.ReactNode }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard redirectTo={options?.redirectTo} fallback={options?.fallback}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
