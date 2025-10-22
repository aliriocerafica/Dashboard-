import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    return NextResponse.redirect(new URL("/splash", request.url));
  }

  // If trying to access auth page while already authenticated
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
