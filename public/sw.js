// Nom du cache et fichiers à mettre en cache
const CACHE_NAME = 'gtctri-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/GTCTRI64.jpg',
  '/GTCTRI192.jpg',
  '/GTCTRI512.jpg',
  '/manifest.json',
  '/styles.css',
  '/scripts.js'
];

// Installation du service worker et mise en cache des fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Gestion des requêtes réseau avec le service worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne, sinon on la récupère via le réseau
        return response || fetch(event.request);
      })
  );
});

// Activation du service worker et suppression des anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/GTCTRI192.jpg',
    badge: '/GTCTRI64.jpg',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});






// public/sw.js

self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/GTCTRI192.jpg',
    badge: '/GTCTRI64.jpg'
  };

  event.waitUntil(
    self.registration.showNotification("GTCTRI: " + data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Ajout d'un gestionnaire d'installation pour configurer le badge
self.addEventListener('install', function(event) {
  event.waitUntil(
    self.registration.setBadge(1)
  );
});
