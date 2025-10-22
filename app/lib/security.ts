// Security utilities and configurations
import crypto from "crypto";

// Security headers configuration
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.emailjs.com https://docs.google.com; frame-src 'self' https://docs.google.com;",
};

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many login attempts, please try again later",
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Too many requests, please try again later",
  },
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Rate limit exceeded for sensitive operations",
  },
};

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/on\w+=/gi, "") // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Encryption utilities
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function encryptSensitiveData(data: string, key: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptSensitiveData(
  encryptedData: string,
  key: string
): string {
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Session security
export interface SecureSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export function createSecureSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): SecureSession {
  return {
    id: generateSecureToken(),
    userId,
    token: generateSecureToken(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ipAddress,
    userAgent,
    createdAt: new Date(),
  };
}

// API security middleware
export function validateApiRequest(request: Request): {
  isValid: boolean;
  error?: string;
} {
  const userAgent = request.headers.get("user-agent");
  const origin = request.headers.get("origin");

  // Check for suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    return { isValid: false, error: "Invalid user agent" };
  }

  // Check for suspicious origins (basic check)
  if (
    origin &&
    !origin.includes("localhost") &&
    !origin.includes("127.0.0.1")
  ) {
    // In production, validate against allowed domains
    const allowedDomains = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (
      allowedDomains.length > 0 &&
      !allowedDomains.some((domain) => origin.includes(domain))
    ) {
      return { isValid: false, error: "Unauthorized origin" };
    }
  }

  return { isValid: true };
}

// Data masking for sensitive information
export function maskSensitiveData(data: any, fields: string[]): any {
  if (typeof data !== "object" || data === null) return data;

  const masked = { ...data };
  fields.forEach((field) => {
    if (masked[field]) {
      const value = String(masked[field]);
      if (value.length > 4) {
        masked[field] =
          value.substring(0, 2) +
          "*".repeat(value.length - 4) +
          value.substring(value.length - 2);
      } else {
        masked[field] = "*".repeat(value.length);
      }
    }
  });

  return masked;
}

// Audit logging
export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export function createAuditLog(
  action: string,
  resource: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  userId?: string,
  details?: any
): SecurityAuditLog {
  return {
    id: generateSecureToken(),
    timestamp: new Date(),
    userId,
    action,
    resource,
    ipAddress,
    userAgent,
    success,
    details,
  };
}

// Environment security check
export function validateEnvironmentSecurity(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for required environment variables
  const requiredEnvVars = [
    "DASHBOARD_USERNAME",
    "DASHBOARD_PASSWORD",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
  ];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      issues.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Check for weak passwords
  if (
    process.env.DASHBOARD_PASSWORD &&
    process.env.DASHBOARD_PASSWORD.length < 12
  ) {
    issues.push(
      "Dashboard password is too weak (minimum 12 characters recommended)"
    );
  }

  // Check for development credentials in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.DASHBOARD_PASSWORD === "dashboardforall@123") {
      issues.push("Using default password in production is not secure");
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
