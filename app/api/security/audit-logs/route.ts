import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, getSecurityMetrics } from "@/app/lib/auditLogger";
import { logSecurityEvent, AUDIT_ACTIONS } from "@/app/lib/auditLogger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Check if user is authenticated (basic check)
    const isAuthenticated =
      request.cookies.get("authenticated")?.value === "true";
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Log audit log access
    logSecurityEvent(
      AUDIT_ACTIONS.SENSITIVE_ACCESS,
      "/api/security/audit-logs",
      request,
      true,
      request.cookies.get("username")?.value
    );

    const logs = getAuditLogs(userId || undefined, action || undefined, limit);
    const metrics = getSecurityMetrics();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        metrics,
        total: logs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
