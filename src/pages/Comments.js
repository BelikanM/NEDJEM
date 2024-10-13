import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

const Comments = ({ uploadId, user }) => {
  const [comments, setComments] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const q = query(collection(db, 'commentaires'), where('uploadId', '==', uploadId));
      onSnapshot(q, async (querySnapshot) => {
        const commentsData = [];
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          commentsData.push({ id: docSnap.id, ...data });

          if (!userProfiles[data.userId]) {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              setUserProfiles(prev => ({
                ...prev,
                [data.userId]: userDoc.data(),
              }));
            }
          }
        }
        setComments(commentsData);
      });
    };

    fetchComments();
  }, [uploadId, userProfiles]);

  const handleAddComment = async () => {
    if (newComment.trim() === '' || !user) return;

    await addDoc(collection(db, 'commentaires'), {
      text: newComment,
      uploadId,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });

    setNewComment('');
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold">Commentaires</h3>
      {user && (
        <div className="mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="border p-2 w-full"
          />
          <button onClick={handleAddComment} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Envoyer
          </button>
        </div>
      )}
      {comments.map(comment => {
        const commentUser = userProfiles[comment.userId] || {};
        return (
          <div key={comment.id} className="flex items-center mb-2">
            <img
              src={commentUser.photoURL || '/default-profile.png'}
              alt={commentUser.displayName || 'Utilisateur'}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-sm font-bold">{commentUser.displayName || 'Anonyme'}</p>
              <p className="text-gray-600">{comment.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Comments;
