/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

// Définit le nom du cache
const CACHE_NAME = "my-app-cache";

// Ajoute les fichiers au cache généré automatiquement lors de la construction.
precacheAndRoute(self.__WB_MANIFEST);

// Caches les fichiers statiques (ex : images, CSS, JS)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          // Vérifie si la réponse est valide avant de la mettre en cache
          if (response && response.status === 200) {
            return response;
          }
          return null;
        },
      },
    ],
  })
);

// Écoute les événements `fetch`
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Écoute les événements `push` pour les notifications.
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Default message',
    icon: '/icons/icon-192x192.png', // Assurez-vous que le chemin est correct
    badge: '/icons/badge.png' // Assurez-vous que le chemin est correct
  };
  event.waitUntil(
    self.registration.showNotification('Notification title', options)
  );
});







self.addEventListener('push', (event) => {
  const data = event.data.json();
  const { title, body, icon } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
