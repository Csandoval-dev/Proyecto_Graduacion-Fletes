const CACHE_NAME = 'fletia-pwa-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo192.png'];
// Escuchar mensajes en segundo plano
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});
// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
// Función para manejar mensajes en segundo plano
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Solo cachear http/https (evita errores con chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  // Network-first para navegación (evita servir index.html viejo con JS hash incorrecto)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Solo cachear respuestas exitosas
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
