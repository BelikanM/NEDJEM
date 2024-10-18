import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaReply, FaEdit, FaTrash, FaPaperclip, FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';

const Chat = ({ uploadId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [media, setMedia] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const q = query(collection(db, 'commentaires'), where('uploadId', '==', uploadId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [uploadId]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profiles = {};
      const uniqueUserIds = new Set(comments.map(comment => comment.userId));
      for (const userId of uniqueUserIds) {
        if (!userProfiles[userId]) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data();
          }
        }
      }
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    };
    fetchUserProfiles();
  }, [comments, userProfiles]);

  const handleAddComment = async () => {
    if (newComment.trim() === '' && !media && !audioUrl) return;

    let mediaUrl = '';
    if (media) {
      const storage = getStorage();
      const mediaRef = ref(storage, `media/${media.name}`);
      await uploadBytes(mediaRef, media);
      mediaUrl = await getDownloadURL(mediaRef);
    }

    if (audioUrl) {
      mediaUrl = audioUrl;
    }

    if (editingCommentId) {
      await updateDoc(doc(db, 'commentaires', editingCommentId), {
        text: newComment,
        mediaUrl,
        updatedAt: serverTimestamp(),
      });
      setEditingCommentId(null);
    } else {
      await addDoc(collection(db, 'commentaires'), {
        text: newComment,
        uploadId,
        userId: user.uid,
        replyTo,
        mediaUrl,
        createdAt: serverTimestamp(),
      });
    }

    setNewComment('');
    setMedia(null);
    setAudioUrl(null);
    setReplyTo(null);
  };

  const handleEdit = (commentId, text) => {
    setEditingCommentId(commentId);
    setNewComment(text);
  };

  const handleDelete = async (commentId) => {
    await deleteDoc(doc(db, 'commentaires', commentId));
  };

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleReply = (comment) => {
    setReplyTo(comment.id);
    setNewComment(`@${userProfiles[comment.userId]?.displayName || 'Utilisateur inconnu'}: "${comment.text.split(' ').slice(0, 5).join(' ')}..."`);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert('Recording not supported in this browser.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const storage = getStorage();
      const audioRef = ref(storage, `audio/${Date.now()}.webm`);
      await uploadBytes(audioRef, audioBlob);
      const url = await getDownloadURL(audioRef);
      setAudioUrl(url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="mt-4">
      <button onClick={toggleChat} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
        {showChat ? 'Cacher' : 'Afficher'}
      </button>
      {showChat && (
        <div className="mt-4">
          {user && (
            <div className="mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="border p-2 w-full"
              />
              <div className="flex items-center space-x-2 mt-2">
                <label className="cursor-pointer">
                  <FaPaperclip className="text-gray-600" />
                  <input
                    type="file"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-1 rounded flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
                >
                  {isRecording ? <FaStop /> : <FaMicrophone />}
                </button>
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white p-1 rounded flex items-center justify-center"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2 h-64 overflow-y-auto border p-2">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-2">
                <img
                  src={userProfiles[comment.userId]?.profilePhotoUrl || 'default-profile.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">{userProfiles[comment.userId]?.displayName || 'Utilisateur inconnu'}</p>
                  <p className="text-gray-600">{comment.text}</p>
                  {comment.mediaUrl && (
                    <div className="mt-2">
                      {comment.mediaUrl.includes('audio') ? (
                        <audio controls src={comment.mediaUrl} className="w-full" />
                      ) : (
                        <img
                          src={comment.mediaUrl}
                          alt="Media"
                          className="max-w-full h-auto rounded"
                          style={{ maxHeight: '150px' }}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex space-x-2 mt-1 text-gray-500">
                    <FaReply
                      onClick={() => handleReply(comment)}
                      className="cursor-pointer"
                    />
                    {comment.userId === user.uid && (
                      <>
                        <FaEdit
                          onClick={() => handleEdit(comment.id, comment.text)}
                          className="cursor-pointer"
                        />
                        <FaTrash
                          onClick={() => handleDelete(comment.id)}
                          className="cursor-pointer"
                        />
                      </>
                    )}
                    {comment.replyTo && (
                      <p className="text-xs text-gray-500">En réponse à {userProfiles[comment.replyTo]?.displayName}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
