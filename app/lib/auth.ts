// Authentication utilities
export interface LoginCredentials {
  username: string;
  password: string;
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.DASHBOARD_USERNAME || 'admin';
  const validPassword = process.env.DASHBOARD_PASSWORD || 'admin123';
  
  return username === validUsername && password === validPassword;
}

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('authenticated') === 'true';
}

// Set authentication status
export function setAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    sessionStorage.setItem('authenticated', 'true');
  } else {
    sessionStorage.removeItem('authenticated');
  }
}

// Logout
export function logout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('authenticated');
}

