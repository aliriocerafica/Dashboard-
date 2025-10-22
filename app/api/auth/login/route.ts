import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/app/lib/auth";
import { sanitizeInput, validatePassword } from "@/app/lib/security";
import { logSecurityEvent, AUDIT_ACTIONS } from "@/app/lib/auditLogger";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedUsername || !sanitizedPassword) {
      // Log failed login attempt
      logSecurityEvent(
        AUDIT_ACTIONS.LOGIN,
        "/api/auth/login",
        request,
        false,
        sanitizedUsername,
        { reason: "Missing credentials" }
      );

      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength (for new passwords)
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid && sanitizedPassword.length > 0) {
      // Log weak password attempt
      logSecurityEvent(
        AUDIT_ACTIONS.LOGIN,
        "/api/auth/login",
        request,
        false,
        sanitizedUsername,
        { reason: "Weak password", errors: passwordValidation.errors }
      );
    }

    const isValid = validateCredentials(sanitizedUsername, sanitizedPassword);

    if (isValid) {
      // Log successful login
      logSecurityEvent(
        AUDIT_ACTIONS.LOGIN,
        "/api/auth/login",
        request,
        true,
        sanitizedUsername
      );

      console.log("Login successful");
      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          username: sanitizedUsername,
        },
        { status: 200 }
      );
    } else {
      // Log failed login attempt
      logSecurityEvent(
        AUDIT_ACTIONS.LOGIN,
        "/api/auth/login",
        request,
        false,
        sanitizedUsername,
        { reason: "Invalid credentials" }
      );

      console.log("Login failed - invalid credentials");
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    // Log error
    logSecurityEvent(
      AUDIT_ACTIONS.LOGIN,
      "/api/auth/login",
      request,
      false,
      undefined,
      { error: error instanceof Error ? error.message : "Unknown error" }
    );

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
