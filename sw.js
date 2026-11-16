const CACHE_NAME = 'blackbox-v11';         // ficheiros da app
const RUNTIME_CACHE = 'blackbox-runtime-v1'; // sprites, PokeAPI e fontes
const MAX_RUNTIME_ENTRIES = 1000;

// Ativa imediatamente sem bloquear a instalação com centenas de KB em conexões móveis lentas
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => {
        for (const client of clients) {
          if ('navigate' in client) {
            client.navigate(client.url).catch(() => {});
          }
        }
      })
  );
});

let _putCount = 0;
async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Para navegação HTML (index.html): tenta rede com timeout curto (3.5s) e guarda em cache;
// se estiver offline ou rede móvel bloqueada, usa a cópia em cache imediatamente.
function handleNavigationRequest(request) {
  return caches.open(CACHE_NAME).then((cache) =>
    fetchWithTimeout(request, 3500)
      .then((res) => {
        if (res && res.ok) {
          cache.put(request, res.clone());
          cache.put('index.html', res.clone());
        }
        return res;
      })
      .catch(() =>
        cache.match(request, { ignoreSearch: true }).then((cached) =>
          cached || cache.match('index.html', { ignoreSearch: true }) || Response.error()
        )
      )
  );
}

// Para recursos estáticos próprios (JS/CSS/Manifest/Ícones com ?v=11):
// Se já tiver exatamente esta versão (?v=11) em cache, responde em 0ms;
// caso contrário busca na rede, guarda em cache e tem fallback offline.
function handleStaticAssetRequest(request) {
  return caches.open(CACHE_NAME).then((cache) =>
    cache.match(request).then((exactCached) => {
      if (exactCached) return exactCached;
      return fetchWithTimeout(request, 6000)
        .then((res) => {
          if (res && res.ok) {
            cache.put(request, res.clone());
          }
          return res;
        })
        .catch(() =>
          cache.match(request, { ignoreSearch: true }).then((fallback) =>
            fallback || Response.error()
          )
        );
    })
  );
}

// Sprites quase nunca mudam: cópia guardada primeiro em modo CORS
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
    if (url.pathname.endsWith('/atualizar.html')) {
      return;
    }
    const isNav = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (isNav) {
      e.respondWith(handleNavigationRequest(req));
    } else {
      e.respondWith(handleStaticAssetRequest(req));
    }
  } else if (url.hostname === 'raw.githubusercontent.com' && url.pathname.indexOf('/PokeAPI/sprites/') === 0) {
    e.respondWith(cacheFirst(req));
  }
});
