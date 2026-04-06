const CACHE_NAME = ‘eiskasse-v1’;

const ASSETS = [
‘/index.html’,
‘/manifest.json’,
‘/icons/icon-192x192.png’,
‘/icons/icon-512x512.png’,
‘/icons/apple-touch-icon.png’,
// Google Fonts – cached on first load
‘https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap’,
// SheetJS für Excel-Export
‘https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js’,
];

// ── Install: pre-cache core assets ──
self.addEventListener(‘install’, event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => {
return Promise.allSettled(
ASSETS.map(url => cache.add(url).catch(err => {
console.warn(’[SW] Failed to cache:’, url, err);
}))
);
}).then(() => self.skipWaiting())
);
});

// ── Activate: remove old caches ──
self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys
.filter(key => key !== CACHE_NAME)
.map(key => caches.delete(key))
)
).then(() => self.clients.claim())
);
});

// ── Fetch: Cache-first, fallback to network ──
self.addEventListener(‘fetch’, event => {
// Skip non-GET and chrome-extension requests
if (event.request.method !== ‘GET’) return;
if (event.request.url.startsWith(‘chrome-extension://’)) return;

event.respondWith(
caches.match(event.request).then(cached => {
if (cached) return cached;

```
  return fetch(event.request).then(response => {
    // Only cache valid responses
    if (!response || response.status !== 200 || response.type === 'error') {
      return response;
    }
    const responseClone = response.clone();
    caches.open(CACHE_NAME).then(cache => {
      cache.put(event.request, responseClone);
    });
    return response;
  }).catch(() => {
    // Offline fallback for navigation requests
    if (event.request.mode === 'navigate') {
      return caches.match('/index.html');
    }
  });
})
```

);
});
