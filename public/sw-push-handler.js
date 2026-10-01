// Service Worker Push & Background Alert Handler for Mausam PWA
// Enables background OS system notifications even when the app is closed or minimized

const CACHE_NAME = 'mausam-offline-alerts-v1';

// Handle Server Push Events (Fires even when browser/app is completely closed)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: '⚠️ Mausam Severe Weather Alert',
      body: event.data ? event.data.text() : 'Severe weather conditions reported for your location.',
    };
  }

  const title = data.title || '⚠️ Mausam Weather Alert';
  const options = {
    body: data.body || 'Official IMD weather bulletin in effect.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'mausam-severe-alert',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: '/#alerts-banner-section',
      timestamp: Date.now(),
      severity: data.severity || 'red',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicking notifications from the OS system notification tray/lock screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/#alerts-banner-section';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Periodic Background Sync (Triggers in background by OS even if app is closed, e.g. Chrome/Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mausam-weather-alert-sync' || event.tag === 'mausam-periodic-alert') {
    event.waitUntil(checkAndNotifyCachedAlerts('Periodic Sync'));
  }
});

// One-shot Background Sync (When network reconnects or background queue runs)
self.addEventListener('sync', (event) => {
  if (event.tag === 'mausam-weather-alert-sync' || event.tag === 'mausam-background-sync') {
    event.waitUntil(checkAndNotifyCachedAlerts('Background Sync'));
  }
});

// Inspect stored offline alerts in CacheStorage and fire notification if severe
async function checkAndNotifyCachedAlerts(source = 'Background') {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/offline-alerts.json');
    if (!response) {
      // Default safety heartbeat if alerts are active
      return self.registration.showNotification('Mausam Weather Monitor', {
        body: 'Background monitoring active: Tap to view latest synoptic forecasts & radar bulletins.',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'mausam-periodic-heartbeat',
        data: { url: '/' },
      });
    }

    const payload = await response.json();
    const alerts = payload.alerts || [];
    const location = payload.location || 'Your Area';

    // Check for Red or Orange critical alerts
    const criticalAlert = alerts.find((a) => a.severity === 'red') || alerts.find((a) => a.severity === 'orange');
    if (criticalAlert) {
      return self.registration.showNotification(
        criticalAlert.title ? `⚠️ ${criticalAlert.title}` : '⚠️ IMD Severe Weather Warning',
        {
          body: `${criticalAlert.message} • ${location} [${source}]`,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `mausam-alert-${criticalAlert.id || 'severe'}`,
          requireInteraction: criticalAlert.severity === 'red',
          vibrate: [200, 100, 200],
          data: {
            url: '/#alerts-banner-section',
            timestamp: Date.now(),
          },
        }
      );
    }
  } catch (err) {
    console.warn('[SW] checkAndNotifyCachedAlerts error:', err);
  }
}

// Background message channel for in-app or background triggers
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // 1. Direct request to show background notification
  if (event.data.type === 'SHOW_BACKGROUND_ALERT') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        ...options,
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/pwa-192x192.png',
      })
    );
  }

  // 2. Register offline alerts to CacheStorage so the SW can notify even when app is closed
  if (event.data.type === 'REGISTER_OFFLINE_ALERTS') {
    const { alerts, location, timestamp } = event.data;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        const payload = JSON.stringify({
          alerts,
          location,
          timestamp: timestamp || Date.now(),
        });
        const response = new Response(payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        return cache.put('/offline-alerts.json', response);
      })
    );
  }

  // 3. Schedule a delayed background alert (fires after window minimizes or closes)
  if (event.data.type === 'SCHEDULE_BACKGROUND_ALERT') {
    const { title, options, delayMs } = event.data;
    const delay = typeof delayMs === 'number' ? delayMs : 5000;
    setTimeout(() => {
      self.registration.showNotification(title, {
        ...options,
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        data: {
          url: '/#alerts-banner-section',
          timestamp: Date.now(),
        },
      });
    }, delay);
  }
});
