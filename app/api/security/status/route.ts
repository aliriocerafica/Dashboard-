import { NextRequest, NextResponse } from "next/server";
import { validateEnvironmentSecurity } from "@/app/lib/security";
import { getSecurityMetrics } from "@/app/lib/auditLogger";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const isAuthenticated =
      request.cookies.get("authenticated")?.value === "true";
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get security status
    const envSecurity = validateEnvironmentSecurity();
    const metrics = getSecurityMetrics();

    const securityStatus = {
      environment: {
        isValid: envSecurity.isValid,
        issues: envSecurity.issues,
      },
      metrics: {
        totalEvents: metrics.totalEvents,
        failedLogins: metrics.failedLogins,
        successfulLogins: metrics.successfulLogins,
        apiCalls: metrics.apiCalls,
        suspiciousActivity: metrics.suspiciousActivity,
      },
      recommendations: generateSecurityRecommendations(envSecurity, metrics),
    };

    return NextResponse.json({
      success: true,
      data: securityStatus,
    });
  } catch (error) {
    console.error("Error fetching security status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch security status" },
      { status: 500 }
    );
  }
}

function generateSecurityRecommendations(
  envSecurity: any,
  metrics: any
): string[] {
  const recommendations: string[] = [];

  if (!envSecurity.isValid) {
    recommendations.push("Fix environment security issues");
  }

  if (metrics.failedLogins > 10) {
    recommendations.push(
      "High number of failed login attempts - consider implementing account lockout"
    );
  }

  if (metrics.suspiciousActivity > 5) {
    recommendations.push("Suspicious activity detected - review audit logs");
  }

  if (metrics.apiCalls > 1000) {
    recommendations.push(
      "High API usage - consider implementing additional rate limiting"
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.DASHBOARD_PASSWORD === "dashboardforall@123"
  ) {
    recommendations.push("Change default password in production environment");
  }

  return recommendations;
}
