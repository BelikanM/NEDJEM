import React, { useEffect } from 'react';
import { messaging } from './firebase';

const PushNotificationButton = () => {
  useEffect(() => {
    messaging.requestPermission()
      .then(() => {
        return messaging.getToken();
      })
      .then(token => {
        console.log('Token:', token);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  return (
    <button>Enable Push Notifications</button>
  );
};

export default PushNotificationButton;
