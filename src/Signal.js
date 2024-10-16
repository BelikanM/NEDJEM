// Signal.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

function Signal({ currentUser, users }) {
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, `users/${currentUser.uid}/notifications`));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newNotifications = [];
        querySnapshot.forEach((doc) => {
          const notification = doc.data();
          const sender = users.find((user) => user.id === notification.senderId);
          if (sender) {
            newNotifications.push({
              id: doc.id,
              senderId: notification.senderId,
              senderName: sender.displayName,
              text: notification.text,
            });
          }
        });
        setNotifications(newNotifications);
        setHasNewMessage(newNotifications.length > 0);
      });
      return () => unsubscribe();
    }
  }, [currentUser, users]);

  const toggleNotifications = () => {
    setShowNotifications((prevState) => !prevState);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          hasNewMessage ? 'bg-red-500 animate-pulse' : 'bg-gray-700'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
      {showNotifications && (
        <div className="absolute top-10 right-0 w-64 bg-white text-gray-800 rounded shadow-lg z-10">
          <h3 className="text-lg font-bold p-2">Notifications</h3>
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className="px-2 py-1 border-b border-gray-200">
                <strong>{notification.senderName}</strong>: {notification.text.slice(0, 20)}
                {notification.text.length > 20 && '...'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Signal;
