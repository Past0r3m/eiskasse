const CACHE_VERSION = 'v16';
const CACHE_NAME = `eiskasse-${CACHE_VERSION}`;
const BASE = '/eiskasse';

// Files that change often — Network-first
const NETWORK_FIRST = [
  `${BASE}/index.html`,
  `${BASE}/`,
  `${BASE}/manifest.json`,
];

// Files that rarely change — Cache-first (pre-cached on install)
const CACHE_FIRST_ASSETS = [
  `${BASE}/icons/icon-72x72.png`,
  `${BASE}/icons/icon-96x96.png`,
  `${BASE}/icons/icon-128x128.png`,
  `${BASE}/icons/icon-144x144.png`,
  `${BASE}/icons/icon-152x152.png`,
  `${BASE}/icons/icon-192x192.png`,
  `${BASE}/icons/icon-384x384.png`,
  `${BASE}/icons/icon-512x512.png`,
  `${BASE}/icons/apple-touch-icon.png`,
  `${BASE}/icons/favicon-32x32.png`,
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
];

// ── Install: pre-cache static assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        CACHE_FIRST_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn('[SW] Failed to cache:', url, err);
        }))
      );
    })
    // KEIN skipWaiting hier! Aktivierung nur per Message aus der App,
    // wenn die Kasse idle ist (Bon leer). Verhindert Reload beim Kassieren.
  );
});

// ── Activate: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart strategy per resource ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);
  const path = url.pathname;
  const isNetworkFirst = NETWORK_FIRST.some(p => path === p || path === p.replace(/\/$/, ''));
  const isNavigation = event.request.mode === 'navigate';

  if (isNetworkFirst || isNavigation) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match(`${BASE}/index.html`);
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    if (request.mode === 'navigate') {
      return caches.match(`${BASE}/index.html`);
    }
    throw err;
  }
}

// ── Listen for skipWaiting message ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});    }).then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart strategy per resource ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);
  const path = url.pathname;
  const isNetworkFirst = NETWORK_FIRST.some(p => path === p || path === p.replace(/\/$/, ''));
  const isNavigation = event.request.mode === 'navigate';

  if (isNetworkFirst || isNavigation) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match(`${BASE}/index.html`);
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    if (request.mode === 'navigate') {
      return caches.match(`${BASE}/index.html`);
    }
    throw err;
  }
}

// ── Listen for skipWaiting message ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
