import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { FaBell } from 'react-icons/fa';

function Chapi({ currentUser, users, onSelectUser }) {
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribes = users.map(user => {
        const chatId = [currentUser.uid, user.id].sort().join('_');
        const q = query(
          collection(db, `chats/${chatId}/messages`),
          where('read', '==', false),
          where('senderId', '==', user.id)
        );
        return onSnapshot(q, (querySnapshot) => {
          setUnreadMessages(prevUnreadMessages => ({
            ...prevUnreadMessages,
            [user.id]: querySnapshot.size,
          }));
        });
      });

      return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    }
  }, [currentUser, users]);

  const totalUnreadMessages = Object.values(unreadMessages).reduce((total, count) => total + count, 0);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-white focus:outline-none"
      >
        <FaBell size={24} />
        {totalUnreadMessages > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {totalUnreadMessages}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-56 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {users.map(user => unreadMessages[user.id] > 0 && (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setShowNotifications(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {user.displayName} ({unreadMessages[user.id]})
              </button>
            ))}
            {totalUnreadMessages === 0 && (
              <div className="px-4 py-2 text-sm text-gray-700">Aucun nouveau message</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chapi;
