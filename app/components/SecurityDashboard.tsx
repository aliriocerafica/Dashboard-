"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import LoadingSpinner from "./LoadingSpinner";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  successfulLogins: number;
  apiCalls: number;
  suspiciousActivity: number;
}

interface SecurityStatus {
  environment: {
    isValid: boolean;
    issues: string[];
  };
  metrics: SecurityMetrics;
  recommendations: string[];
}

export default function SecurityDashboard() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch("/api/security/status");
      const data = await response.json();

      if (data.success) {
        setSecurityStatus(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch security status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading security status..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Security Status Error
        </h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!securityStatus) return null;

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Environment</p>
                <p
                  className={`text-2xl font-bold ${
                    securityStatus.environment.isValid
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {securityStatus.environment.isValid ? "Secure" : "Issues"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Failed Logins
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {securityStatus.metrics.failedLogins}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">API Calls</p>
                <p className="text-2xl font-bold text-blue-600">
                  {securityStatus.metrics.apiCalls}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Suspicious Activity
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {securityStatus.metrics.suspiciousActivity}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Environment Issues */}
      {!securityStatus.environment.isValid && (
        <Card className="bg-red-50 border border-red-200 rounded-xl">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Environment Security Issues
            </h3>
          </CardHeader>
          <CardBody className="pt-0">
            <ul className="space-y-2">
              {securityStatus.environment.issues.map((issue, index) => (
                <li
                  key={index}
                  className="text-sm text-red-700 flex items-start"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 shrink-0"></span>
                  {issue}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Security Recommendations */}
      {securityStatus.recommendations.length > 0 && (
        <Card className="bg-blue-50 border border-blue-200 rounded-xl">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Security Recommendations
            </h3>
          </CardHeader>
          <CardBody className="pt-0">
            <ul className="space-y-2">
              {securityStatus.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-700 flex items-start"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Security Metrics Chart */}
      <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Security Activity (Last 24 Hours)
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {securityStatus.metrics.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {securityStatus.metrics.successfulLogins}
              </div>
              <div className="text-sm text-gray-600">Successful Logins</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {securityStatus.metrics.failedLogins}
              </div>
              <div className="text-sm text-gray-600">Failed Logins</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {securityStatus.metrics.suspiciousActivity}
              </div>
              <div className="text-sm text-gray-600">Suspicious Activity</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
