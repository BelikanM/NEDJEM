import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const publicVapidKey = 'BL3VX5LZkaERWTPu3R6Ky8q2_2OVlvySUXSjb-eX09G7HCG3Ieggcr0XTRgM63gzn4wDQiH_Kq_3Klmy_TV4dOw';

export function usePushSubscription() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      subscribe();
    }
  }, []);

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      setSubscription(subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  return subscription;
}
