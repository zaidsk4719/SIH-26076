/**
 * Utility for managing client-side device/session identifiers.
 * Stored once in localStorage to scope user preferences to the current device/session.
 *
 * NOTE: Real authentication (login-based JWT/OAuth) is still a known gap.
 * This session identifier provides client-side device scoping to guard against
 * arbitrary cross-client overwrite of preferences.
 */

const DEVICE_SESSION_KEY = 'mausam_device_session_id';

export function getOrCreateDeviceSessionId(): string {
  try {
    let sessionId = localStorage.getItem(DEVICE_SESSION_KEY);
    if (!sessionId) {
      sessionId = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'dev_fallback_session_id';
  }
}
