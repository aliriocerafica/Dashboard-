"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import LoginForm from "../components/LoginForm";
import {
  isAuthenticated,
  setAuthenticated,
  getCurrentUsername,
  logout,
  getUserByUsername,
  isAdmin,
  User,
} from "../lib/auth";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("admin");
  const [user, setUser] = useState<User | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  // Password change form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    if (authenticated) {
      const storedUsername = getCurrentUsername();
      if (storedUsername) {
        setUsername(storedUsername);
        const userData = getUserByUsername(storedUsername);
        if (userData) {
          setUser(userData);
          setIsUserAdmin(isAdmin(storedUsername));
        }
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthenticated(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Reset after 3 seconds
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account and change your password
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6 border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.fullName || username}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.email || "No email"}
                </p>
                <div className="inline-flex items-center gap-2 mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  {user?.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* User Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Type</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isUserAdmin ? "text-purple-600" : "text-blue-600"
                    }`}
                  >
                    {isUserAdmin ? (
                      <>
                        <ShieldCheckIcon className="w-4 h-4" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-4 h-4" />
                        User
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      user?.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-semibold text-gray-900">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  router.push("/home");
                }}
                className="w-full mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Right: Change Password Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Change Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-4 top-3.5"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-3.5"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Success</h4>
                      <p className="text-sm text-green-700 mt-1">{success}</p>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Minimum 6 characters</li>
                    <li>• Must be different from current password</li>
                    <li>• New password must match confirmation</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                    }`}
                  >
                    {isLoading ? "Updating Password..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Admin Features */}
            {isUserAdmin && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Admin Features
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <UserGroupIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        User Management
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Manage user accounts, roles, and permissions
                      </p>
                      <button
                        onClick={() => router.push("/admin/user-management")}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Go to User Management →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Account Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-600">
                      Available for enhanced security
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
