import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "./lib/rateLimiter";
import { logSecurityEvent, AUDIT_ACTIONS } from "./lib/auditLogger";
import { securityHeaders } from "./lib/security";

// Pages that require authentication
const protectedPages = [
  "/sales",
  "/marketing",
  "/finance",
  "/hr",
  "/operations",
  "/it",
  "/president",
  "/admin",
  "/profile",
  "/home",
];

// Pages that should never be accessed when authenticated
const authPages = ["/splash", "/login"];

// API routes that need special rate limiting
const sensitiveApiRoutes = [
  "/api/auth/login",
  "/api/auth/change-password",
  "/api/submit-it-asset-request",
  "/api/update-request-status",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const isSensitive = sensitiveApiRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const rateLimitType = isSensitive ? "sensitive" : "api";

    const rateLimitResult = checkRateLimit(request, rateLimitType);

    if (!rateLimitResult.allowed) {
      // Log failed rate limit attempt
      logSecurityEvent(
        "RATE_LIMIT_EXCEEDED",
        pathname,
        request,
        false,
        undefined,
        { rateLimitType, limit: rateLimitResult.remaining }
      );

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: rateLimitResult.error,
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            ...securityHeaders,
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      rateLimitResult.resetTime.toString()
    );
  }

  // Check if the current page requires authentication
  const isProtectedPage = protectedPages.some((page) =>
    pathname.startsWith(page)
  );
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  // Get authentication status from cookies or headers
  const isAuthenticated =
    request.cookies.get("authenticated")?.value === "true" ||
    request.headers.get("x-authenticated") === "true";

  // If trying to access protected page without authentication
  if (isProtectedPage && !isAuthenticated) {
    // Log unauthorized access attempt
    logSecurityEvent(
      AUDIT_ACTIONS.API_ACCESS,
      pathname,
      request,
      false,
      undefined,
      { reason: "Unauthenticated access attempt" }
    );

    // Redirect directly to login to avoid splash screen delay
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access auth page while already authenticated
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Log successful access to protected resources
  if (isProtectedPage && isAuthenticated) {
    logSecurityEvent(
      AUDIT_ACTIONS.API_ACCESS,
      pathname,
      request,
      true,
      request.cookies.get("username")?.value
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
