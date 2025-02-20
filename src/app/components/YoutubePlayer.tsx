'use client';

import React from 'react';

const YouTubePlayer = () => {
  const playlistId = 'PL6NdkXsPL07KqOQymt2EyI03C01U9Opxi';

  return (
    <div className="backdrop-blur-md bg-black/50 p-2 md:p-4">
      <div className="max-w-xl mx-auto">
        <iframe
          width="560"
          height="80"
          src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
          title="YouTube playlist"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
