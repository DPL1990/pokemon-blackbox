const CACHE_NAME = 'blackbox-v7';
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