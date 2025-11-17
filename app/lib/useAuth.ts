"use client";

import { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUsername, isAdmin, canAccessUserManagement } from "./auth";

// Custom event for auth changes within the same tab
const AUTH_CHANGE_EVENT = "auth-change";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [hasUserManagementAccess, setHasUserManagementAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      const currentUsername = getCurrentUsername();
      const adminStatus = currentUsername ? isAdmin(currentUsername) : false;
      const userManagementAccess = currentUsername ? canAccessUserManagement(currentUsername) : false;

      setAuthenticated(auth);
      setUsername(currentUsername);
      setIsAdminUser(adminStatus);
      setHasUserManagementAccess(userManagementAccess);
      setIsLoading(false);
    };

    // Check immediately
    checkAuth();

    // Set a timeout to prevent infinite loading (fallback)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced to 500ms for faster response

    // Listen for both storage changes (other tabs) and custom events (same tab)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return {
    authenticated,
    username,
    isAdminUser,
    hasUserManagementAccess,
    isLoading,
  };
}

// Helper function to trigger auth change events
export function triggerAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
}
