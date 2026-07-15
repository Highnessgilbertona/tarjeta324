/* Tarjeta 324 — service worker · Fase 1 */
const CACHE = 'tarjeta324-f1-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo manejar archivos propios; las llamadas externas (direcciones GPS) pasan directo
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((res) => {
      if (res) return res;
      return fetch(e.request)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
          return r;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
