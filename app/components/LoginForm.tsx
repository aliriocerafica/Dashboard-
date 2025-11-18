"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LockClosedIcon,
  LockOpenIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { setCurrentUsername } from "../lib/auth";
import { triggerAuthChange } from "../lib/useAuth";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("dashboard_username");
    const savedPassword = localStorage.getItem("dashboard_password");
    const savedRememberMe =
      localStorage.getItem("dashboard_rememberMe") === "true";

    if (savedUsername && savedPassword && savedRememberMe) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Handle "Remember Me" functionality
        if (rememberMe) {
          localStorage.setItem("dashboard_username", username);
          localStorage.setItem("dashboard_password", password);
          localStorage.setItem("dashboard_rememberMe", "true");
        } else {
          // Clear saved credentials if "Remember Me" is unchecked
          localStorage.removeItem("dashboard_username");
          localStorage.removeItem("dashboard_password");
          localStorage.removeItem("dashboard_rememberMe");
        }

        // Store username in session
        setCurrentUsername(username);
        sessionStorage.setItem("authenticated", "true");
        // Also set cookie for server-side authentication
        document.cookie = "authenticated=true; path=/; max-age=86400"; // 24 hours

        // Trigger auth change event to update all components immediately
        triggerAuthChange();

        onLoginSuccess();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if both fields are filled
  const isFormFilled = username.trim() !== "" && password.trim() !== "";

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-linear-to-br from-red-50 via-pink-50 to-orange-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyMjEsMjEyLDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#ff6d74]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Column - GIF Background with Modern Overlay */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden">
        {/* GIF Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/gif/Login.gif"
            alt="Dashboard Illustration"
            fill
            unoptimized
            priority
            className="object-cover"
          />
        </div>
        
        {/* Modern Gradient Overlay with animation */}
        <div className="absolute inset-0 bg-linear-to-br from-[#ff6d74]/90 via-red-500/85 to-pink-600/90 z-10"></div>
        
        {/* Animated Overlay Effects */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Glassmorphism Content Card */}
        <div className="relative z-20 max-w-lg w-full">
          {/* Content Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                Welcome Back
              </h2>
            </div>
            <p className="text-lg text-white/95 leading-relaxed mb-6 drop-shadow">
              Access powerful business intelligence and real-time analytics across
              all your departments.
            </p>
            
            {/* Feature Pills */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-white/90 text-sm font-medium">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-white/90 text-sm font-medium">Secure Access Control</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '1s' }}></div>
                <span className="text-white/90 text-sm font-medium">Multi-Department Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-md w-full">
          {/* Glassmorphism Card Container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-[#ff6d74]/20 to-red-400/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -z-10"></div>

            {/* Form Header */}
            <div className="text-center mb-8">
            {/* Animated Lock Icon */}
            <div className="relative inline-block mb-4">
              <div className={`absolute inset-0 bg-linear-to-r ${isFormFilled ? 'from-green-500 to-emerald-500' : 'from-[#ff6d74] to-red-500'} rounded-2xl blur-xl opacity-50 animate-pulse transition-all duration-500`}></div>
              <div className={`relative flex items-center justify-center w-16 h-16 bg-linear-to-br ${isFormFilled ? 'from-green-500 to-emerald-500' : 'from-[#ff6d74] to-red-500'} rounded-2xl shadow-xl transition-all duration-500 transform ${isFormFilled ? 'scale-110' : 'scale-100'}`}>
                {isFormFilled ? (
                  <LockOpenIcon className="w-8 h-8 text-white animate-bounce" />
                ) : (
                  <LockClosedIcon className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-red-900 to-[#ff6d74] bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff6d74] rounded-full animate-pulse"></span>
              Sign in to continue
            </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="group">
                <label
                  htmlFor="username"
                  className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    focusedField === 'username' ? 'text-[#ff6d74]' : 'text-gray-700'
                  }`}
                >
                  Username
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 z-10 ${
                    focusedField === 'username' ? 'text-[#ff6d74]' : 'text-gray-500'
                  }`}>
                    <UserIcon className="h-5 w-5 stroke-2" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ff6d74]/20 focus:border-[#ff6d74] outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                  {focusedField === 'username' && (
                    <div className="absolute inset-0 rounded-xl bg-linear-to-r from-[#ff6d74]/10 to-red-500/10 -z-10 blur-sm"></div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-[#ff6d74]' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 z-10 ${
                    focusedField === 'password' ? 'text-[#ff6d74]' : 'text-gray-500'
                  }`}>
                    <LockClosedIcon className="h-5 w-5 stroke-2" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#ff6d74]/20 focus:border-[#ff6d74] outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group z-10"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500 group-hover:text-[#ff6d74] transition-colors duration-300 stroke-2" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500 group-hover:text-[#ff6d74] transition-colors duration-300 stroke-2" />
                    )}
                  </button>
                  {focusedField === 'password' && (
                    <div className="absolute inset-0 rounded-xl bg-linear-to-r from-[#ff6d74]/10 to-red-500/10 -z-10 blur-sm"></div>
                  )}
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-linear-to-r peer-checked:from-[#ff6d74] peer-checked:to-red-500 transition-all duration-300 shadow-inner"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-4 shadow-md"></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-[#ff6d74] transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-[#ff6d74] hover:text-red-600 transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative overflow-hidden bg-linear-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake shadow-lg">
                  <div className="absolute inset-0 bg-linear-to-r from-red-500/10 to-pink-500/10"></div>
                  <div className="relative flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full py-4 px-6 rounded-xl text-white font-bold text-lg overflow-hidden transition-all duration-300 transform ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-[#ff6d74] via-red-500 to-pink-600 hover:from-[#ff5964] hover:via-red-600 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {/* Animated background on hover */}
                {!isLoading && (
                  <div className="absolute inset-0 bg-linear-to-r from-[#ff8b91] via-red-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                )}
                
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <p className="text-center text-xs text-gray-500">
                Protected Dashboard • Contact administrator for access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
