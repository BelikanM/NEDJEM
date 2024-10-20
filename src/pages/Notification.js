// pages/Notification.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, or, doc, updateDoc } from 'firebase/firestore';
import { FaBell } from 'react-icons/fa';
import { usePushSubscription } from './push-subscription';
import { sendPushNotification } from './push-api';
import { showNotification } from './notification-api';

const Notification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscription = usePushSubscription();

  useEffect(() => {
    if (!user || !user.uid) return;

    const q = query(
      collection(db, 'commentaires'),
      or(
        where('userId', '==', user.uid),
        where('participants', 'array-contains', user.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isRead: doc.data().readBy && doc.data().readBy.includes(user.uid)
      }));

      setNotifications(notificationsData);
      const newUnreadCount = notificationsData.filter(n => !n.isRead).length;
      setUnreadCount(newUnreadCount);

      // Mise à jour du badge de l'application
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(newUnreadCount);
      }

      // Envoi de notifications push pour les nouveaux commentaires non lus
      notificationsData.forEach(notification => {
        if (!notification.isRead) {
          const notificationData = {
            title: 'Nouveau commentaire',
            body: notification.text
          };
          if (subscription) {
            sendPushNotification(subscription, notificationData);
          }
          showNotification(notificationData.title, { 
            body: notificationData.body,
            icon: '/GTCTRI192.jpg',
            badge: '/GTCTRI64.jpg'
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user, subscription]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    const updatedReadBy = notification.readBy ? [...notification.readBy, user.uid] : [user.uid];

    const notificationRef = doc(db, 'commentaires', notificationId);
    await updateDoc(notificationRef, {
      readBy: updatedReadBy
    });
  };

  return (
    <div className="relative">
      <button onClick={toggleNotifications} className="relative">
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="w-80 max-w-xs bg-white border-2 border-gray-800 shadow-lg rounded-lg relative">
            <div className="flex justify-between items-center p-2 border-b border-gray-800">
              <h4 className="text-sm font-bold">GTCTRI Notifications</h4>
              <button onClick={toggleNotifications} className="text-gray-600 hover:text-gray-800">
                &times;
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-2 text-sm text-gray-600">Aucune notification</p>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-300 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-xs text-gray-800">
                      {notification.userId === user.uid ? 'Vous avez commenté' : 'Nouveau commentaire'}
                    </p>
                    <p className="text-xs text-gray-600">{notification.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
