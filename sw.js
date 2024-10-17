// Nom du cache et fichiers à mettre en cache
const CACHE_NAME = 'gtctri-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/GTCTRI64.jpg',
  '/GTCTRI192.jpg',
  '/GTCTRI512.jpg',
  '/manifest.json',
  '/styles.css',  // Ajoutez ici d'autres fichiers CSS, JS ou images si nécessaire
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
