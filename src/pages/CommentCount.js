import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const CommentCount = ({ uploadId }) => {
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'commentaires'), where('uploadId', '==', uploadId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setCommentCount(querySnapshot.size);
    });
    return () => unsubscribe();
  }, [uploadId]);

  return (
    <div className="text-blue-500 font-bold mb-2">
      {commentCount} Commentaires
    </div>
  );
};

export default CommentCount;
