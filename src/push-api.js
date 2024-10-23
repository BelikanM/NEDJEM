// src/push-api.js

export async function sendPushNotification(subscription, data) {
  try {
    await fetch('/api/push', {
      method: 'POST',
      body: JSON.stringify({
        subscription: subscription,
        data: data
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
