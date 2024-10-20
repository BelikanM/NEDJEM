export function askNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  }
}

export function showNotification(title, message) {
  if ('Notification' in window) {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        registration.showNotification(title, {
          body: message,
          icon: 'https://example.com/icon.png'
        });
      })
      .catch(error => {
        console.error('Erreur lors de l\'envoi de la notification', error);
      });
  }
}
