'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const YouTubePlayer = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
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
    <div className={`transition-all duration-300 ${isFullWidth ? 'w-full' : 'max-w-xl mx-auto'}`}>
      <div className="relative">
        <div 
          className={`
            transition-all duration-300 
            ${isCollapsed ? 'h-12 md:h-14' : 'h-48 md:h-72'} 
            bg-black/50
            ${isFullWidth ? '' : 'rounded-lg'}
          `}
        >
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/videoseries?list=${settings.currentPlaylistId}&autoplay=1&controls=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 translate-y-1/2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-pink-600 text-white p-1 rounded-full hover:bg-pink-700 transition-colors shadow-lg"
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
          
          {/* Only show on desktop */}
          <button
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="hidden md:block bg-pink-600 text-white p-1 rounded-full hover:bg-pink-700 transition-colors shadow-lg"
          >
            {isFullWidth ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
