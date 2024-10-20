import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Show = () => {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      const notificationRef = doc(db, 'commentaires', id);
      const notificationSnap = await getDoc(notificationRef);

      if (notificationSnap.exists()) {
        setNotification({ id: notificationSnap.id, ...notificationSnap.data() });
      } else {
        console.log('Aucune notification trouvée avec cet ID');
      }
    };

    fetchNotification();
  }, [id]);

  if (!notification) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Détails de la notification</h2>
      <div className="bg-white shadow-md rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">
          {notification.userId ? 'Vous avez commenté' : 'Nouveau commentaire'}
        </p>
        <p className="text-base">{notification.text}</p>
      </div>
    </div>
  );
};

export default Show;
