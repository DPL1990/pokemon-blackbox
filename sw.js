const CACHE_NAME = 'blackbox-v8';          // ficheiros da app
const RUNTIME_CACHE = 'blackbox-runtime-v1'; // sprites, PokeAPI e fontes
const MAX_RUNTIME_ENTRIES = 1000;
const ASSETS = [
  'index.html',
  'manifest.json',
  'styles.css',
  'js/moves-db.js',
  'js/items-db.js',
  'js/constants.js',
  'js/helpers.js',
  'js/db.js',
  'js/save-parser.js',
  'js/allocation.js',
  'js/editor.js',
  'js/ui.js',
  'blackbox_app_icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

let _putCount = 0;
async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

// Responde logo com a cópia guardada e atualiza-a em segundo plano
function staleWhileRevalidate(request, cacheName, matchOptions) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request, matchOptions).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone()).then(() => {
            if (cacheName === RUNTIME_CACHE && ++_putCount % 50 === 0) trimCache(cacheName, MAX_RUNTIME_ENTRIES);
          });
        }
        return res;
      }).catch(() => cached || Response.error());
      return cached || network;
    })
  );
}

// Sprites quase nunca mudam: cópia guardada primeiro.
// Pede-se em modo CORS (o GitHub permite) para a resposta não ser "opaca": respostas opacas
// contam ~7 MB cada na quota do browser, o que encheria o armazenamento com poucas centenas de sprites.
function cacheFirst(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request.url, { mode: 'cors', credentials: 'omit' }).then((res) => {
        if (res && res.ok) {
          cache.put(request, res.clone()).then(() => {
            if (++_putCount % 50 === 0) trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
          });
        }
        return res;
      }).catch(() => fetch(request));
    })
  );
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      staleWhileRevalidate(req, CACHE_NAME, { ignoreSearch: true }).then((res) =>
        res && res.status ? res : caches.match('index.html')
      )
    );
  } else if (url.hostname === 'raw.githubusercontent.com' && url.pathname.indexOf('/PokeAPI/sprites/') === 0) {
    e.respondWith(cacheFirst(req));
  } else if (url.hostname === 'pokeapi.co' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
  }
});
