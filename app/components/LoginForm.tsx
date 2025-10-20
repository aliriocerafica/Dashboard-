'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LockClosedIcon, LockOpenIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('dashboard_username');
    const savedPassword = localStorage.getItem('dashboard_password');
    const savedRememberMe = localStorage.getItem('dashboard_rememberMe') === 'true';

    if (savedUsername && savedPassword && savedRememberMe) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Handle "Remember Me" functionality
        if (rememberMe) {
          localStorage.setItem('dashboard_username', username);
          localStorage.setItem('dashboard_password', password);
          localStorage.setItem('dashboard_rememberMe', 'true');
        } else {
          // Clear saved credentials if "Remember Me" is unchecked
          localStorage.removeItem('dashboard_username');
          localStorage.removeItem('dashboard_password');
          localStorage.removeItem('dashboard_rememberMe');
        }

        sessionStorage.setItem('authenticated', 'true');
        onLoginSuccess();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if both fields are filled
  const isFormFilled = username.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen flex">
      {/* Left Column - GIF with Gradient Overlay */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/gif/login.gif"
            alt="Dashboard Illustration"
            fill
            unoptimized
            priority
            className="object-cover"
          />
        </div>

        {/* Gradient Overlay - Red Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6d74]/85 via-[#ff6d74]/80 to-red-500/80 z-10"></div>

        {/* Content */}
        <div className="relative z-20 max-w-md w-full text-white text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Dashboard For All
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Access powerful business intelligence and real-time analytics across all your departments. 
            Manage, monitor, and drive better decisions with our comprehensive dashboard.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#ff6d74] rounded-xl mb-4 shadow-lg transition-all duration-300">
              {isFormFilled ? (
                <LockOpenIcon className="w-7 h-7 text-white animate-pulse" />
              ) : (
                <LockClosedIcon className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">User Login</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6d74] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6d74] focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#ff6d74]"
                style={{accentColor: '#ff6d74'}}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
              <a href="#" className="ml-auto text-sm text-[#ff6d74] hover:text-red-600">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#ff6d74] hover:bg-red-600 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Protected Dashboard • Contact administrator for access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

