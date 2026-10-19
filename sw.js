// Service Worker do Bolso Viagem: cache-first do próprio app.
// Ao alterar qualquer arquivo, aumente o número da versão abaixo para forçar a atualização.
const CACHE = 'bolso-viagem-v2';
const ARQUIVOS = [
  './', './index.html', './manifest.json',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copia));
        }
        return resp;
      });
    })
  );
});
