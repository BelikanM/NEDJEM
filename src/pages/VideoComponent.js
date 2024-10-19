import React, { useRef, useEffect, useState, Suspense } from 'react';

const VideoComponent = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current.muted = false;
          videoRef.current.play().catch((error) => console.log(error));
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.75, // Higher threshold for better control
    });

    const currentVideo = videoRef.current;
    if (currentVideo) {
      observer.observe(currentVideo);
    }

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
      }
    };
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <video
      ref={videoRef}
      controls
      controlsList="nodownload"
      src={videoUrl}
      className="w-full mt-2"
      autoPlay
      loop
      playsInline
      onContextMenu={handleContextMenu}
      preload="auto"
      style={{ objectFit: 'cover' }}
    />
  );
};

const VideoContainer = ({ videoUrl }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoComponent videoUrl={videoUrl} />
    </Suspense>
  );
};

export default VideoContainer;
