import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CounterView = ({ videoRef, videoId, userId }) => {
  const [viewCount, setViewCount] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const fetchViewData = async () => {
      try {
        const response = await axios.get(`/api/views/${videoId}/${userId}`);
        setViewCount(response.data.viewCount);
        setHasViewed(response.data.hasViewed);
      } catch (error) {
        console.error("Erreur lors de la récupération des données de vue:", error);
      }
    };

    fetchViewData();
  }, [videoId, userId]);

  useEffect(() => {
    const handleViewIncrement = async () => {
      if (!hasViewed) {
        try {
          await axios.post(`/api/views/${videoId}`, { userId });
          setViewCount((prevCount) => prevCount + 1);
          setHasViewed(true);
        } catch (error) {
          console.error("Erreur lors de l'incrémentation du nombre de vues:", error);
        }
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('play', handleViewIncrement);
      return () => {
        videoElement.removeEventListener('play', handleViewIncrement);
      };
    }
  }, [videoRef, videoId, userId, hasViewed]);

  return (
    <div className="mt-2">
      <p>Nombre de vues: {viewCount}</p>
    </div>
  );
};

export default CounterView;
