import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { FaVideo, FaSignOutAlt, FaGoogle, FaMicrophone, FaPaperPlane, FaImage } from 'react-icons/fa';
import './Chat.css'; // Importez le fichier CSS pour les styles

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpHAFxdho0Gb63EE86k-NmSrD1zckEcSQ",
  authDomain: "starviews.firebaseapp.com",
  projectId: "starviews",
  storageBucket: "starviews.appspot.com",
  messagingSenderId: "92372461515",
  appId: "1:92372461515:web:957158c9f62cb94ca6384e"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [inCall, setInCall] = useState(false); // Pour savoir si l'utilisateur est en appel
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Connexion via Google
  const signIn = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        setUser(result.user);
      })
      .catch(error => console.error(error));
  };

  // Déconnexion
  const signOutUser = () => {
    signOut(auth).then(() => setUser(null)).catch(error => console.error(error));
  };

  // Récupérer les utilisateurs depuis Firestore (liste des utilisateurs connectés)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map(doc => doc.data());
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  // Récupérer les messages en temps réel de la collection "messages" de Firestore
  useEffect(() => {
    if (selectedUser && user) {
      const q = query(
        collection(db, "messages"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map(doc => doc.data());
        setMessages(messagesList);
      });
      return () => unsubscribe();
    }
  }, [selectedUser, user]);

  // Fonction pour envoyer un message (texte simple pour commencer)
  const sendMessage = async () => {
    if (!user || !selectedUser) return;

    const msgData = {
      text: message,
      sender: user.uid,
      receiver: selectedUser.uid,
      createdAt: serverTimestamp(),
      participants: [user.uid, selectedUser.uid]
    };

    try {
      await addDoc(collection(db, "messages"), msgData);
      setMessage(''); // Vider l'input après l'envoi du message
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  // Fonction pour démarrer ou arrêter un appel vidéo
  const toggleVideoCall = async () => {
    if (inCall) {
      // Si déjà en appel, on arrête l'appel
      endVideoCall();
      return;
    }

    try {
      // Démarrer un appel vidéo
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setLocalStream(stream);

      const pc = new RTCPeerConnection(servers);
      setPeerConnection(pc);

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const remoteStream = new MediaStream();
      setRemoteStream(remoteStream);

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCallActive(true);
      setInCall(true);

    } catch (error) {
      console.error("Error starting video call:", error);
    }
  };

  // Fonction pour arrêter un appel vidéo
  const endVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setCallActive(false);
    setInCall(false);
  };

  return (
    <div className="chat-container">
      {/* En-tête */}
      <header className="chat-header">
        {user ? (
          <>
            <div className="user-info">
              <img src={user.photoURL} alt="profile" className="user-avatar" />
              <span>{user.displayName}</span>
            </div>
            <button onClick={signOutUser} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <button onClick={signIn} className="login-btn">
            <FaGoogle /> Sign in with Google
          </button>
        )}
      </header>

      {/* Contenu principal */}
      <div className="chat-main">
        {/* Barre latérale pour la liste des utilisateurs */}
        <aside className="chat-sidebar">
          <h3>Users</h3>
          <ul className="user-list">
            {users.map(u => (
              <li
                key={u.uid}
                className={`user-item ${u.uid === selectedUser?.uid ? 'active' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <img src={u.photoURL || 'https://via.placeholder.com/50'} alt="profile" className="user-item-avatar" />
                {u.displayName}
                {u.uid === selectedUser?.uid && inCall && <span className="call-notification">CALLING...</span>}
              </li>
            ))}
          </ul>
        </aside>

        {/* Zone de chat */}
        <main className="chat-area">
          {selectedUser ? (
            <>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === user.uid ? 'sent' : 'received'}`}
                  >
                    <img src={msg.sender === user.uid ? user.photoURL : selectedUser.photoURL} alt="profile" className="message-avatar" />
                    {msg.text && <p>{msg.text}</p>}
                  </div>
                ))}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <button onClick={sendMessage} className="send-btn"><FaPaperPlane /></button>
                <button onClick={toggleVideoCall} className={`call-btn ${inCall ? 'active' : ''}`}><FaVideo /> {inCall ? 'End Call' : 'Call'}</button>
              </div>

              {callActive && (
                <div className="video-chat">
                  {/* Vidéo locale */}
                  <video ref={localVideoRef} autoPlay playsInline muted></video>

                  {/* Vidéo distante */}
                  <video ref={remoteVideoRef} autoPlay playsInline></video>
                </div>
              )}
            </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
