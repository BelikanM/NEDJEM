export function showNotification(title, message) {
  if ('Notification' in window) {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        registration.showNotification(title, {
          body: message,
          icon: require('./GTCTRI64.jpg')
        });
      })
      .catch(error => {
        console.error('Erreur lors de l\'envoi de la notification', error);
      });
  }
}
