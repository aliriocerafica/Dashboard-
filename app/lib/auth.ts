// Authentication utilities
export interface LoginCredentials {
  username: string;
  password: string;
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.DASHBOARD_USERNAME || 'admin';
  const validPassword = process.env.DASHBOARD_PASSWORD || 'admin123';
  
  // Debug logging (remove in production)
  console.log('Validating credentials...');
  console.log('Expected username:', validUsername);
  console.log('Received username:', username);
  console.log('Password match:', password === validPassword);
  
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

// Get current username from session (client-side)
export function getCurrentUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('username') || null;
}

// Set username in session (client-side)
export function setCurrentUsername(username: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('username', username);
}

// Store new password temporarily (for verification - in production use secure cookies)
export function updateStoredPassword(password: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('currentPassword', password);
}