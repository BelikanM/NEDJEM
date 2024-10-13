import React, { useEffect, useState } from 'react';

const Algo = ({ searchTerm, uploads }) => {
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  useEffect(() => {
    if (!searchTerm) {
      setRecommendedVideos([]);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const similarVideos = uploads.filter(upload =>
      upload.title.toLowerCase().includes(lowerTerm) || 
      upload.description.toLowerCase().includes(lowerTerm)
    );

    setRecommendedVideos(similarVideos);
  }, [searchTerm, uploads]);

  return (
    <div className="flex overflow-x-auto space-x-4 p-4">
      {recommendedVideos.map(video => (
        <div key={video.id} className="w-64 flex-shrink-0">
          <h3 className="font-bold">{video.title}</h3>
          {video.imageUrl && (
            <img src={video.imageUrl} alt="Video thumbnail" className="w-full" />
          )}
          {video.videoUrl && (
            <video controls src={video.videoUrl} className="w-full mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Algo;
