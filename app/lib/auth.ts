// Authentication utilities
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Default users database
const defaultUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "dashboardforall@123",
    role: "admin",
    fullName: "System Administrator",
    email: "admin@company.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user",
    password: "user123",
    role: "user",
    fullName: "Dashboard User",
    email: "user@company.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Get users from localStorage or use defaults
function getUsers(): User[] {
  if (typeof window === "undefined") return defaultUsers;
  const stored = localStorage.getItem("dashboard_users");
  const users = stored ? JSON.parse(stored) : defaultUsers;
  return users;
}

// Save users to localStorage
function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("dashboard_users", JSON.stringify(users));
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.isActive);

  if (!user) return false;

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  return user.password === password;
}

export function getUserByUsername(username: string): User | null {
  const users = getUsers();
  const user = users.find((u) => u.username === username) || null;
  return user;
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function createUser(userData: Omit<User, "id" | "createdAt">): User {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(
  userId: string,
  updates: Partial<User>
): User | null {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return null;

  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);
  return users[userIndex];
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  saveUsers(users);
  return true;
}

export function isAdmin(username: string): boolean {
  const user = getUserByUsername(username);
  return user?.role === "admin" || false;
}

// Force reset users to default (for debugging)
export function resetUsersToDefault(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dashboard_users");
}

// Force initialize admin user
export function initializeAdminUser(): void {
  if (typeof window === "undefined") return;

  // Clear existing data
  localStorage.removeItem("dashboard_users");

  // Force save default users
  saveUsers(defaultUsers);
}

// Check if user is authenticated (client-side) - with caching
let authCache: boolean | null = null;
let authCacheTime = 0;
const AUTH_CACHE_DURATION = 500; // 500ms cache for faster response

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  if (authCache !== null && now - authCacheTime < AUTH_CACHE_DURATION) {
    return authCache;
  }

  // Check both sessionStorage and cookies for authentication
  const sessionAuth = sessionStorage.getItem("authenticated") === "true";
  const cookieAuth = document.cookie.includes("authenticated=true");
  const authenticated = sessionAuth || cookieAuth;

  authCache = authenticated;
  authCacheTime = now;
  return authenticated;
}

// Set authentication status
export function setAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    sessionStorage.setItem("authenticated", "true");
    // Set cookie with proper attributes for server-side authentication
    // Remove Secure flag for localhost development
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const secureFlag = isLocalhost ? "" : "; Secure";
    document.cookie = `authenticated=true; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  } else {
    sessionStorage.removeItem("authenticated");
    // Remove cookie
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const secureFlag = isLocalhost ? "" : "; Secure";
    document.cookie = `authenticated=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  }
  // Clear cache when auth status changes
  authCache = null;
  authCacheTime = 0;
}

// Logout
export function logout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("authenticated");
  sessionStorage.removeItem("username");
  // Remove cookie with proper attributes
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : "; Secure";
  document.cookie = `authenticated=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  document.cookie = `username=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  // Clear cache on logout
  authCache = null;
  authCacheTime = 0;

  // Trigger auth change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"));
  }
}

// Get current username from session (client-side)
export function getCurrentUsername(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("username") || null;
}

// Set username in session (client-side)
export function setCurrentUsername(username: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("username", username);
  // Also set cookie for server-side authentication
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : "; Secure";
  document.cookie = `username=${username}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
}

// Store new password temporarily (for verification - in production use secure cookies)
export function updateStoredPassword(password: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("currentPassword", password);
}

// Clear all authentication data (for debugging and recovery)
export function clearAllAuthData(): void {
  if (typeof window === "undefined") return;

  // Clear session storage
  sessionStorage.removeItem("authenticated");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("currentPassword");

  // Clear cookies
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : "; Secure";
  document.cookie = `authenticated=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  document.cookie = `username=; path=/; max-age=0; SameSite=Lax${secureFlag}`;

  // Clear cache
  authCache = null;
  authCacheTime = 0;

  // Trigger auth change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"));
  }
}
