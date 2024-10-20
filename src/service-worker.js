// src/service-worker.js
const CACHE_NAME = "my-app-cache";
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

// Ajoute les fichiers au cache généré automatiquement lors de la construction.
precacheAndRoute(self.__WB_MANIFEST);

// Écoute les événements `push` pour les notifications.
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Default message',
    icon: '/path/to/icon.png',
    badge: '/path/to/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification('Notification title', options)
  );
});
