/**
 * TUMU TIGER — Service Worker
 *
 * Strategy: NETWORK-FIRST for everything. We always try the network first
 * (so people always get the latest CSS/JS/pages when they have a
 * connection — this is deliberate, to avoid ever repeating the "stale
 * cached CSS on mobile" problem). We only fall back to whatever was last
 * cached when the network request fails (i.e. the user is offline), so
 * the app still opens instead of showing a browser error.
 *
 * This file's only real job is to make the site installable as an app
 * and to provide a basic offline fallback — it is NOT an aggressive
 * offline-first cache.
 */

const CACHE_NAME = 'tumutiger-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never touch non-GET requests (login, forms, uploads, payments, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful, same-origin responses.
        if (response && response.ok && event.request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
