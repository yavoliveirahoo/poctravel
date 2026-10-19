// Service Worker do Bolso Viagem.
// Estratégia: rede primeiro (pega sempre a versão mais nova quando há internet)
// e cache como reserva (o app continua abrindo 100% offline).
// Ao publicar uma versão nova, aumente o número abaixo.
const CACHE = 'bolso-viagem-v7';
const ARQUIVOS = [
  './', './index.html', './manifest.json',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARQUIVOS.map(u => new Request(u, { cache: 'reload' }))))
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
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(resp => {
        if (resp && resp.status === 200) {
          const copia = resp.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copia)));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(cached => cached || caches.match('./index.html'))
      )
  );
});
