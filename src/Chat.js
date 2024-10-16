import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth, storage } from './firebaseConfig';
import { collection, query, onSnapshot, addDoc, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

function EditMessageModal({ message, onSave, onCancel }) {
  const [editedText, setEditedText] = useState(message.text);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Modifier le message</h3>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full bg-gray-700 text-white rounded p-2 mb-4"
          rows="4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="bg-gray-600 text-white rounded px-4 py-2">Annuler</button>
          <button onClick={() => onSave(editedText)} className="bg-blue-600 text-white rounded px-4 py-2">Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMedia, setNewMedia] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        updateUserInFirestore(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'users'));
      const unsubscribeUsers = onSnapshot(q, (querySnapshot) => {
        const userList = [];
        querySnapshot.forEach((doc) => {
          const userData = {
            id: doc.id,
            displayName: doc.data().displayName,
            profilePhotoUrl: doc.data().profilePhotoUrl,
            coverPhotoUrl: doc.data().coverPhotoUrl,
          };
          if (userData.id !== currentUser.uid) {
            userList.push(userData);
          }
        });
        setUsers(userList);
      });

      return () => unsubscribeUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && selectedUser) {
      const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
      const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messageList = [];
        querySnapshot.forEach((doc) => {
          messageList.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messageList);
      });
      return () => unsubscribe();
    }
  }, [currentUser, selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateUserInFirestore = useCallback(async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: user.displayName,
        profilePhotoUrl: user.photoURL,
      });
    }
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && currentUser) {
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(currentUser, { photoURL: downloadURL });
      await updateUserInFirestore(currentUser);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() || newMedia) {
      const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
      let mediaUrl = '';
      if (newMedia) {
        const storageRef = ref(storage, `chatMedia/${chatId}/${Date.now()}_${newMedia.name}`);
        await uploadBytes(storageRef, newMedia);
        mediaUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: newMessage.trim(),
        mediaUrl,
        mediaType: newMedia ? newMedia.type.split('/')[0] : null,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      setNewMedia(null);
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
    await updateDoc(messageRef, { text: newText });
    setEditingMessage(null);
  };

  const handleDeleteMessage = async (messageId) => {
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="py-6 px-4">
        <h1 className="text-3xl font-bold mb-4">Chat Privé</h1>
        {currentUser && (
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img 
                  src={currentUser.photoURL || 'https://via.placeholder.com/96x96.png?text=You'} 
                  alt={currentUser.displayName} 
                  className="w-full h-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                </label>
              </div>
              <span className="text-xl font-semibold">{currentUser.displayName}</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto whitespace-nowrap pb-4">
          <div className="inline-flex space-x-4">
            {users.map(user => (
              <div key={user.id} className="flex flex-col items-center">
                <div 
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer ${selectedUser && selectedUser.id === user.id ? 'border-4 border-blue-500' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <img 
                    src={user.profilePhotoUrl || 'https://via.placeholder.com/128x128.png?text=User'} 
                    alt={user.displayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-semibold truncate w-20 sm:w-24 md:w-32 text-center">{user.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      </header>
      <main className="p-4">
        {selectedUser ? (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Chat avec {selectedUser.displayName}</h2>
            <div className="h-96 overflow-y-auto mb-4 bg-gray-700 rounded p-2">
              {messages.map(message => (
                <div key={message.id} className={`flex mb-4 ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex ${message.senderId === currentUser.uid ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={(message.senderId === currentUser.uid ? currentUser.photoURL : selectedUser.profilePhotoUrl) || 'https://via.placeholder.com/32x32.png?text=User'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${message.senderId === currentUser.uid ? 'mr-2' : 'ml-2'}`}>
                      <div className={`inline-block p-2 rounded-lg ${message.senderId === currentUser.uid ? 'bg-blue-600' : 'bg-gray-600'}`}>
                        <p className="break-words">{message.text}</p>
                        {message.mediaUrl && (
                          <div className="mt-2">
                            {message.mediaType === 'image' ? (
                              <img src={message.mediaUrl} alt="Media" className="max-w-full h-auto rounded" style={{maxHeight: '200px'}} />
                            ) : message.mediaType === 'video' ? (
                              <video controls src={message.mediaUrl} className="max-w-full h-auto rounded" style={{maxHeight: '200px'}} />
                            ) : (
                              <audio controls src={message.mediaUrl} className="max-w-full" />
                            )}
                          </div>
                        )}
                        {message.senderId === currentUser.uid && (
                          <div className="mt-1">
                            <button onClick={() => setEditingMessage(message)} className="text-xs mr-2">✏️</button>
                            <button onClick={() => handleDeleteMessage(message.id)} className="text-xs">🗑️</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow bg-gray-700 text-white rounded p-2"
                placeholder="Tapez votre message..."
              />
              <input
                type="file"
                onChange={(e) => setNewMedia(e.target.files[0])}
                className="hidden"
                id="media-upload"
                accept="image/*,video/*,audio/*"
              />
              <label htmlFor="media-upload" className="bg-gray-700 text-white rounded p-2 cursor-pointer">
                📎
              </label>
              <button onClick={handleSendMessage} className="bg-blue-600 text-white rounded p-2">Envoyer</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Sélectionnez un utilisateur pour commencer à chatter</p>
        )}
      </main>
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={(newText) => handleEditMessage(editingMessage.id, newText)}
          onCancel={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
}

export default Chat;
