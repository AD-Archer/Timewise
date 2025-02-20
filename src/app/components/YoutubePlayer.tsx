'use client';

import React from 'react';

const YouTubePlayer = () => {
  const playlistId = 'PL6NdkXsPL07KqOQymt2EyI03C01U9Opxi';

  return (
    <div className="bg-black/50 backdrop-blur-md shadow-lg">
      <div className="max-w-xl mx-auto">
        <iframe
          width="560"
          height="52"
          src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
          title="YouTube playlist"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
