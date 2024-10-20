// public/firebase-messaging-sw.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/GTCTRI192.jpg',
    badge: '/GTCTRI64.jpg'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
