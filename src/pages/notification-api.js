// pages/notification-api.js

export async function showNotification(title, options) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  } else {
    console.log('Push notifications are not supported in this browser');
  }
}
