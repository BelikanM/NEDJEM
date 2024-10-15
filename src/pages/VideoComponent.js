import React, { useRef, useEffect, useState } from 'react';

const VideoComponent = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.75 // Adjust this value to control visibility percentage
    });

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isPlaying;
    }
  }, [isPlaying]);

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
      muted
      loop
      onContextMenu={handleContextMenu}
    />
  );
};

export default VideoComponent;
