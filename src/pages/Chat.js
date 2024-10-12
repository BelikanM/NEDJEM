// Import Firebase SDK et React
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect, useRef } from 'react';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpHAFxdho0Gb63EE86k-NmSrD1zckEcSQ",
  authDomain: "starviews.firebaseapp.com",
  projectId: "starviews",
  storageBucket: "starviews.appspot.com",
  messagingSenderId: "92372461515",
  appId: "1:92372461515:web:957158c9f62cb94ca6384e"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  // Authentification Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.error('Erreur lors de la connexion:', error);
      });
  };

  // Déconnexion
  const handleSignOut = () => {
    signOut(auth).then(() => setUser(null));
  };

  // Récupération des messages en temps réel
  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, `chats/${selectedChat}/messages`), orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedChat]);

  // Envoi de message texte
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, `chats/${selectedChat}/messages`), {
        text: newMessage,
        uid: user.uid,
        displayName: user.displayName,
        timestamp: new Date(),
        type: 'text',
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  // Envoi de fichier
  const sendFile = async () => {
    if (!file) return;
    
    const storageRef = ref(storage, `files/${new Date().getTime()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Progression du téléchargement
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => console.error('Erreur lors du téléchargement du fichier:', error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, `chats/${selectedChat}/messages`), {
          fileUrl: downloadURL,
          uid: user.uid,
          displayName: user.displayName,
          timestamp: new Date(),
          type: 'file',
          read: false
        });
        setFile(null);
        setUploadProgress(0);
      }
    );
  };

  // Marquer les messages comme lus
  const markAsRead = async () => {
    messages.forEach(async (msg) => {
      if (msg.uid !== user.uid && !msg.read) {
        const msgRef = doc(db, `chats/${selectedChat}/messages`, msg.id);
        await updateDoc(msgRef, { read: true });
      }
    });
  };

  // Suppression d'un message
  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, `chats/${selectedChat}/messages`, id));
  };

  // Fonction de recherche de messages
  const searchMessages = (query) => {
    return messages.filter(msg => msg.text.toLowerCase().includes(query.toLowerCase()));
  };

  // Initialiser les contacts (groupes ou individus)
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map(doc => doc.data());
      setContacts(users);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="chat-container">

      <div className="sidebar">
        <h3>Contacts</h3>
        <ul>
          {contacts.map(contact => (
            <li key={contact.uid} onClick={() => setSelectedChat(contact.uid)}>
              {contact.displayName}
            </li>
          ))}
        </ul>
        <button onClick={handleSignOut}>Déconnexion</button>
      </div>

      <div className="chat-content">
        {!selectedChat ? (
          <div>Sélectionnez un chat</div>
        ) : (
          <>
            <div className="chat-box">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.uid === user?.uid ? 'own' : ''}`}>
                  {msg.type === 'text' ? <span>{msg.text}</span> : <a href={msg.fileUrl}>Télécharger le fichier</a>}
                  <button onClick={() => deleteMessage(msg.id)}>Supprimer</button>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Entrez votre message"
              />
              <button type="submit">Envoyer</button>
            </form>

            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            {file && <button onClick={sendFile}>Envoyer le fichier</button>}
            {uploadProgress > 0 && <div>Progression: {uploadProgress}%</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
