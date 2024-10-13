import React from 'react';

const VideoComponent = ({ videoUrl }) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <video
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
