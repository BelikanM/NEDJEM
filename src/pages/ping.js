import { db } from '../firebaseConfig';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const pingUser = async (senderId, receiverId, message) => {
  try {
    await addDoc(collection(db, 'pings'), {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp()
    });
    // Logique pour notifier le receveur
  } catch (error) {
    console.error("Erreur lors de l'envoi du ping:", error);
  }
};

export const requestRealTimeLocation = async (requesterId, targetId) => {
  try {
    await addDoc(collection(db, 'locationRequests'), {
      requesterId,
      targetId,
      timestamp: serverTimestamp()
    });
    // Logique pour notifier l'utilisateur cible
  } catch (error) {
    console.error("Erreur lors de la demande de localisation:", error);
  }
};

export const createMeetingZone = async (creatorId, location, invitedUsers) => {
  try {
    const zoneRef = await addDoc(collection(db, 'meetingZones'), {
      creatorId,
      location,
      invitedUsers,
      timestamp: serverTimestamp()
    });
    // Logique pour notifier les utilisateurs invités
    return zoneRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la zone de rencontre:", error);
  }
};

export const shareRoute = async (userId, route, sharedWithUsers) => {
  try {
    const routeRef = await addDoc(collection(db, 'sharedRoutes'), {
      userId,
      route,
      sharedWithUsers,
      timestamp: serverTimestamp()
    });
    // Logique pour notifier les utilisateurs avec lesquels l'itinéraire est partagé
    return routeRef.id;
  } catch (error) {
    console.error("Erreur lors du partage de l'itinéraire:", error);
  }
};

export const sendLocationMessage = async (senderId, location, message, expirationTime) => {
  try {
    await addDoc(collection(db, 'locationMessages'), {
      senderId,
      location,
      message,
      expirationTime,
      timestamp: serverTimestamp()
    });
    // Logique pour afficher le message sur la carte pour les utilisateurs à proximité
  } catch (error) {
    console.error("Erreur lors de l'envoi du message lié à la localisation:", error);
  }
};
