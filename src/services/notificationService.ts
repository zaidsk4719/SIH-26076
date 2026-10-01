/**
 * Web Notifications API Service for Weather Alerts (IMD Synoptic System)
 * Manages browser push notifications, permissions, audio alert chimes, and settings.
 */

import { WeatherAlert } from '../types';

export interface WeatherNotificationSettings {
  enabled: boolean;
  redAlerts: boolean;
  orangeAlerts: boolean;
  yellowAlerts: boolean;
  soundChime: boolean;
  notifyWhenAppClosed: boolean;
}

export interface InAppAlertToast {
  id: string;
  title: string;
  body: string;
  severity: 'red' | 'orange' | 'yellow' | 'green';
  location: string;
  timestamp: string;
}

const SETTINGS_KEY = 'mausam_weather_notification_settings';
const DEFAULT_SETTINGS: WeatherNotificationSettings = {
  enabled: true,
  redAlerts: true,
  orangeAlerts: true,
  yellowAlerts: false,
  soundChime: true,
  notifyWhenAppClosed: true,
};

// Track recent alerts to prevent duplicate spam within 5 minutes
const sentAlertCache = new Map<string, number>();

/**
 * Check if the browser supports the Web Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if the browser is running inside an iframe
 */
export function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user via Web Notifications API
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return Notification.permission;
  }
}

/**
 * Get user notification preferences
 */
export function getNotificationSettings(): WeatherNotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user notification preferences
 */
export function saveNotificationSettings(settings: WeatherNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
}

/**
 * Synthesize an emergency alert chime using the Web Audio API
 * No external mp3 or audio asset needed, works completely offline!
 */
export function playWeatherAlertChime(severity: 'red' | 'orange' | 'yellow' | 'green' = 'red'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === 'red') {
      // Urgent high-pitch double pulse for Red Severe Storm
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      osc.frequency.setValueAtTime(1320, now + 0.36);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Harmonic warning chime for Orange/Yellow
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn('Audio chime playback omitted:', e);
  }
}

/**
 * Dispatch an in-app visual push notification toast
 */
export function dispatchInAppAlertToast(toast: InAppAlertToast): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<InAppAlertToast>('mausam-weather-alert-toast', { detail: toast })
  );
}

/**
 * Core function to send a weather alert push notification
 * Supports both standard Web Notifications API and in-app fallback
 */
export async function sendWeatherAlertPush(params: {
  title: string;
  body: string;
  severity: 'red' | 'orange' | 'yellow' | 'green';
  location: string;
  forceTest?: boolean;
}): Promise<boolean> {
  const settings = getNotificationSettings();

  // If user completely disabled notifications in settings and this is not a test
  if (!settings.enabled && !params.forceTest) {
    return false;
  }

  // Check severity preferences
  if (!params.forceTest) {
    if (params.severity === 'red' && !settings.redAlerts) return false;
    if (params.severity === 'orange' && !settings.orangeAlerts) return false;
    if (params.severity === 'yellow' && !settings.yellowAlerts) return false;
  }

  // Deduplication cache (prevent same notification within 5 minutes unless manual test)
  const cacheKey = `${params.severity}_${params.title}_${params.location}`;
  const lastSent = sentAlertCache.get(cacheKey) || 0;
  const now = Date.now();
  if (!params.forceTest && now - lastSent < 5 * 60 * 1000) {
    return false;
  }
  sentAlertCache.set(cacheKey, now);

  // Play audio chime if enabled
  if (settings.soundChime) {
    playWeatherAlertChime(params.severity);
  }

  // 1. Dispatch custom event for rich in-app push notification banner
  const toastDetail: InAppAlertToast = {
    id: `alert-${now}-${Math.random().toString(36).substring(2, 6)}`,
    title: params.title,
    body: params.body,
    severity: params.severity,
    location: params.location,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  dispatchInAppAlertToast(toastDetail);

  // 2. Fire Service Worker background notification or native Web Notifications API if permission granted
  let nativeNotificationFired = false;
  if (isNotificationSupported() && Notification.permission === 'granted') {
    const notificationOptions: NotificationOptions = {
      body: `${params.body} • ${params.location}`,
      tag: `mausam-alert-${params.severity}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      lang: 'en',
      requireInteraction: params.severity === 'red',
      silent: !settings.soundChime,
      data: {
        url: '/',
        severity: params.severity,
        location: params.location,
        timestamp: Date.now(),
      },
    };

    // Prefer Service Worker showNotification if active (works in background/minimized)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
        ]);

        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(params.title, notificationOptions);
          nativeNotificationFired = true;
        }
      } catch (swErr) {
        console.warn('Service Worker showNotification attempt failed, trying fallback:', swErr);
      }
    }

    // Fallback to standard window Notification if Service Worker was unavailable
    if (!nativeNotificationFired) {
      try {
        const notification = new Notification(params.title, notificationOptions);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        nativeNotificationFired = true;
      } catch (err) {
        console.warn('Native Web Notification was blocked or failed, in-app toast was displayed:', err);
      }
    }
  }

  return nativeNotificationFired || true;
}

/**
 * Register active alerts with Service Worker and CacheStorage for background notification
 * Enables OS notifications even if the app or browser tabs are closed.
 */
export async function registerServiceWorkerBackgroundAlerts(
  alerts: WeatherAlert[],
  location: string
): Promise<void> {
  if (typeof window === 'undefined' || !alerts || alerts.length === 0) return;

  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.notifyWhenAppClosed) return;

  try {
    // 1. Store in CacheStorage so Service Worker can read it offline / in background
    if ('caches' in window) {
      const cache = await caches.open('mausam-offline-alerts-v1');
      const payload = JSON.stringify({
        alerts,
        location,
        timestamp: Date.now(),
      });
      await cache.put(
        '/offline-alerts.json',
        new Response(payload, {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // 2. Notify active Service Worker controller
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REGISTER_OFFLINE_ALERTS',
        alerts,
        location,
        timestamp: Date.now(),
      });
    }

    // 3. Register Periodic Background Sync if supported (e.g. Chrome on Android / Desktop PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('periodicSync' in registration) {
        try {
          const status = await (navigator as any).permissions?.query({
            name: 'periodic-background-sync',
          });
          if (status?.state === 'granted') {
            await (registration as any).periodicSync.register('mausam-weather-alert-sync', {
              minInterval: 15 * 60 * 1000, // 15 minutes minimum interval
            });
          }
        } catch {
          // Periodic sync permission policy not met in standard window; handled gracefully
        }
      }

      // 4. Register one-shot background sync if supported
      if ('sync' in registration) {
        try {
          await (registration as any).sync.register('mausam-weather-alert-sync');
        } catch {
          // Background sync not supported or permission denied
        }
      }
    }
  } catch (err) {
    console.warn('Background alert synchronization skipped:', err);
  }
}

/**
 * Schedule a delayed background notification via Service Worker
 * Triggered when user minimizes or closes the tab while severe warnings are active.
 */
export async function scheduleBackgroundAlert(params: {
  title: string;
  body: string;
  severity: 'red' | 'orange';
  location: string;
  delayMs?: number;
}): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.notifyWhenAppClosed) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_BACKGROUND_ALERT',
        title: params.title,
        delayMs: params.delayMs || 4000,
        options: {
          body: `${params.body} • ${params.location}`,
          tag: `mausam-bg-${params.severity}`,
          requireInteraction: params.severity === 'red',
        },
      });
    }
  } catch (err) {
    console.warn('Schedule background alert failed:', err);
  }
}

