// Inactivity timeout configuration (in milliseconds)
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
export const INACTIVITY_WARNING = 14 * 60 * 1000; // Show warning at 14 minutes

// Track activity
let inactivityTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();

export function resetInactivityTimer(onWarning: () => void, onLogout: () => void) {
  // Clear existing timers
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);

  lastActivityTime = Date.now();

  // Show warning at 14 minutes
  warningTimer = setTimeout(() => {
    onWarning();
    console.warn('User has been inactive for 14 minutes. Will logout in 1 minute.');
  }, INACTIVITY_WARNING);

  // Logout at 15 minutes
  inactivityTimer = setTimeout(() => {
    onLogout();
    console.warn('User has been inactive for 15 minutes. Auto-logging out.');
  }, INACTIVITY_TIMEOUT);
}

export function clearInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);
}

export function getTimeUntilLogout(): number {
  const elapsed = Date.now() - lastActivityTime;
  const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);
  return remaining;
}
