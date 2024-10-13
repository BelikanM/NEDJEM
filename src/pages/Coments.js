import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';

const Comments = ({ uploadId }) => {
  const [comments, setComments] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});

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

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold">Commentaires</h3>
      {comments.map(comment => {
        const user = userProfiles[comment.userId] || {};
        return (
          <div key={comment.id} className="flex items-center mb-2">
            <img
              src={user.photoURL || '/default-profile.png'}
              alt={user.displayName || 'Utilisateur'}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-sm font-bold">{user.displayName || 'Anonyme'}</p>
              <p className="text-gray-600">{comment.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Comments;
