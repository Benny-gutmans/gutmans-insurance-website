// Service worker for the Lead Tracker app (leads.html).
// Only intercepts the tracker's own files so the rest of the site
// always loads fresh from the network.
const CACHE = 'gutmans-leads-v1';
const APP_FILES = ['/leads.html', '/leads.webmanifest', '/logo.png', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || !APP_FILES.includes(url.pathname)) return; // let everything else hit the network
  // Network-first so updates arrive; cache fallback keeps it working offline.
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
