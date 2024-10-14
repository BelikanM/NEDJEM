import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const Note = ({ user }) => {
  const [comments, setComments] = useState([]);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const history = useHistory();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'comments'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCommentIndex((prevIndex) => (prevIndex + 1) % comments.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [comments]);

  const handleBannerClick = () => {
    history.push('/chat');
  };

  return (
    <div className="banner-container">
      {comments.length > 0 && (
        <div onClick={handleBannerClick} className="banner">
          <img
            src={comments[currentCommentIndex].profilePhotoUrl}
            alt="Profile"
            className="profile-photo"
          />
          <p>
            {comments[currentCommentIndex].text.split(' ').slice(0, 3).join(' ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Note;
