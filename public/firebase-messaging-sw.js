importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBpHAFxdho0Gb63EE86k-NmSrD1zckEcSQ',
  authDomain: 'starviews.firebaseapp.com',
  projectId: 'starviews',
  storageBucket: 'starviews.appspot.com',
  messagingSenderId: '92372461515',
  appId: '1:92372461515:web:957158c9f62cb94ca6384e'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/GTCTRI512.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
