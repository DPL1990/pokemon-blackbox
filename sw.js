const CACHE_NAME = 'blackbox-v3';
const ASSETS = [
  'index.html',
  'manifest.json',
  'styles.css',
  'app.js'
];

// Instalação do Service Worker e Cache dos ficheiros base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação e limpeza de caches antigas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Estratégia Network-First com Fallback para Cache (para não bloquear chamadas à PokeAPI se houver net)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});