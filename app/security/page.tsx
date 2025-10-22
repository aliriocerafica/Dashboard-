"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import SecurityDashboard from "@/app/components/SecurityDashboard";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor security status, audit logs, and system health
          </p>
        </div>

        <SecurityDashboard />
      </div>
    </div>
  );
}
