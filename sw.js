// Slovník Service Worker — Push Notifications
const CACHE = 'slovnik-v1';

// ── Install: cache the app ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['./index.html', './manifest.json'])
    )
  );
  self.skipWaiting();
});

// ── Activate ──
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// ── Fetch: serve from cache, fall back to network ──
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// ── Push: show notification ──
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  const title = data.title || 'Slovník';
  const body  = data.body  || 'Zeit zum Lernen!';
  const badge = data.badge || 0;

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'slovnik-daily',          // replaces previous notification
      renotify: true,
      data: { url: './index.html' }
    })
  );
});

// ── Notification click: open app ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') && 'focus' in client)
          return client.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});

// ── Background Sync: schedule daily reminder check ──
// This fires when network is available — we use it as a daily trigger
self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-reminder') {
    e.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder() {
  // Read vocab from all clients to get due count
  // Since SW can't access localStorage directly, we message the client
  const allClients = await clients.matchAll({ type: 'window' });
  if (allClients.length > 0) {
    allClients[0].postMessage({ type: 'GET_DUE_COUNT' });
  } else {
    // App not open — show generic reminder
    await self.registration.showNotification('Slovník', {
      body: 'Zeit zum Lernen! Öffne die App um zu sehen wie viele Karten fällig sind.',
      icon: './icon-192.png',
      tag: 'slovnik-daily',
      data: { url: './index.html' }
    });
  }
}
