importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDJRMoJ0dSTIkDnrH1XZ2Uo-gS4V6fF1Nc",
  authDomain: "fletia-hnd.firebaseapp.com",
  projectId: "fletia-hnd",
  storageBucket: "fletia-hnd.firebasestorage.app",
  messagingSenderId: "468931936706",
  appId: "1:468931936706:web:0b3f04d2f0d52aba81c7dd"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ MANEJAR MENSAJES EN BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensaje recibido:', payload);

  // Leer título y mensaje
  const titulo = payload.notification?.title || 'Fletia HND';
  const mensaje = payload.notification?.body || 'Nueva notificación';

  console.log('[SW] Mostrando notificación:', titulo, mensaje);

  // ✅ MOSTRAR LA NOTIFICACIÓN
  const notificationOptions = {
    body: mensaje,
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'fletia-' + Date.now(), // Tag único
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: new Date().toISOString()
    }
  };

  // ✅ IMPORTANTE: Retornar la promesa
  return self.registration.showNotification(titulo, notificationOptions);
});

// ✅ MANEJAR CLICKS EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// ✅ LOG CUANDO SE INSTALA EL SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activado');
  event.waitUntil(clients.claim());
});