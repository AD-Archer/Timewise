'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const YouTubePlayer = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { settings } = useSettings();

  // If no playlist is selected, don't show the player
  if (!settings.currentPlaylistId) {
    return (
      <div className="bg-black/50 backdrop-blur-sm p-2 text-center text-white/70 text-sm">
        Select a playlist in settings to play music
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div className={`transition-all duration-300 ${isCollapsed ? 'h-12' : 'h-72'} bg-black/50`}>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/videoseries?list=${settings.currentPlaylistId}&autoplay=1&controls=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-pink-600 text-white p-1 rounded-full hover:bg-pink-700 transition-colors"
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>
    </div>
  );
};

export default YouTubePlayer;
