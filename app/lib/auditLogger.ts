// Security audit logging system
import { createAuditLog, SecurityAuditLog } from "./security";
import { NextRequest } from "next/server";

// In-memory audit log store (in production, use a database)
const auditLogs: SecurityAuditLog[] = [];

export function logSecurityEvent(
  action: string,
  resource: string,
  request: NextRequest,
  success: boolean,
  userId?: string,
  details?: any
): void {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  const auditEntry = createAuditLog(
    action,
    resource,
    ip,
    userAgent,
    success,
    userId,
    details
  );

  auditLogs.push(auditEntry);

  // Keep only last 1000 entries to prevent memory issues
  if (auditLogs.length > 1000) {
    auditLogs.splice(0, auditLogs.length - 1000);
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[AUDIT] ${action} on ${resource} - ${success ? "SUCCESS" : "FAILED"}`,
      {
        userId,
        ip,
        timestamp: auditEntry.timestamp,
      }
    );
  }
}

export function getAuditLogs(
  userId?: string,
  action?: string,
  limit: number = 100
): SecurityAuditLog[] {
  let filteredLogs = auditLogs;

  if (userId) {
    filteredLogs = filteredLogs.filter((log) => log.userId === userId);
  }

  if (action) {
    filteredLogs = filteredLogs.filter((log) => log.action === action);
  }

  return filteredLogs
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getSecurityMetrics(): {
  totalEvents: number;
  failedLogins: number;
  successfulLogins: number;
  apiCalls: number;
  suspiciousActivity: number;
} {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentLogs = auditLogs.filter((log) => log.timestamp >= last24Hours);

  return {
    totalEvents: recentLogs.length,
    failedLogins: recentLogs.filter(
      (log) => log.action === "LOGIN" && !log.success
    ).length,
    successfulLogins: recentLogs.filter(
      (log) => log.action === "LOGIN" && log.success
    ).length,
    apiCalls: recentLogs.filter((log) => log.action.startsWith("API_")).length,
    suspiciousActivity: recentLogs.filter(
      (log) => !log.success && log.action !== "LOGIN"
    ).length,
  };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return (
    (request as any).ip ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Predefined audit actions
export const AUDIT_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  API_ACCESS: "API_ACCESS",
  DATA_EXPORT: "DATA_EXPORT",
  DATA_IMPORT: "DATA_IMPORT",
  USER_CREATE: "USER_CREATE",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  SENSITIVE_ACCESS: "SENSITIVE_ACCESS",
} as const;
