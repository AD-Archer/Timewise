'use client';

import React from 'react';

const YouTubePlayer = () => {
  const playlistId = 'PL6NdkXsPL07KqOQymt2EyI03C01U9Opxi'; 

  return (
    <div className="flex justify-center p-4">
      <iframe
        width="200"
        height="100"
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
        title="YouTube playlist"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="rounded-lg shadow-lg w-full max-w-xl"
      />
    </div>
  );
};

export default YouTubePlayer;
