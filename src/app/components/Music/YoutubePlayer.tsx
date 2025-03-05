'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Music, Volume2, VolumeX, AlertCircle, Play, Pause } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useMusic } from '../../contexts/MusicContext';

const YouTubePlayer = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { settings } = useSettings();
  const { setIsPlaying: setMusicContextPlaying } = useMusic();
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle click outside to collapse player
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playerRef.current && !playerRef.current.contains(event.target as Node) && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

  // Reset error state when playlist changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    // Reset playing state when playlist changes
    setIsPlaying(false);
    setMusicContextPlaying(false);
  }, [settings.currentPlaylistId, setMusicContextPlaying]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle iframe error events
  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Toggle play/pause state
  const togglePlayback = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    
    try {
      const newState = !isPlaying;
      setIsPlaying(newState);
      setMusicContextPlaying(newState);
      
      // Send message to iframe to play/pause
      const action = newState ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: action,
          args: []
        }), 
        '*'
      );
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Don't render if user has chosen Spotify player
  if (settings.preferredMusicService === 'spotify') {
    return null;
  }

  // If no playlist is selected, show a stylish placeholder
  if (!settings.currentPlaylistId) {
    return (
      <div className="bg-black/20 backdrop-blur-md p-3 text-center text-white/90 text-sm flex items-center justify-center gap-2">
        <Music size={16} className="text-pink-500" />
        <span>Select a playlist in settings to play music</span>
      </div>
    );
  }

  // Determine if we're using a playlist or single video
  const isPlaylist = settings.currentPlaylistId.startsWith('PL');
  
  // Generate YouTube embed URL with parameters - set autoplay to 0 (disabled)
  const youtubeEmbedUrl = isPlaylist
    ? `https://www.youtube.com/embed/videoseries?list=${settings.currentPlaylistId}&autoplay=0&controls=1&mute=${isMuted ? 1 : 0}&enablejsapi=1`
    : `https://www.youtube.com/embed/${settings.currentPlaylistId}?autoplay=0&controls=1&mute=${isMuted ? 1 : 0}&enablejsapi=1`;

  // Get current playlist name
  const currentPlaylist = settings.playlists.find(p => p.id === settings.currentPlaylistId);
  const playlistName = currentPlaylist?.name || 'YouTube Music';

  return (
    <div 
      ref={playerRef}
      className="transition-all duration-300 ease-in-out w-full"
    >
      <div className="relative">
        {/* YouTube Player Container */}
        <div 
          className={`
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'h-12' : 'h-48 sm:h-56 md:h-72'} 
            bg-black/20 backdrop-blur-md
            overflow-hidden
            ${!isCollapsed ? 'rounded-t-lg' : ''}
          `}
        >
          {/* Player Status Bar (visible when collapsed) */}
          {isCollapsed && (
            <div className="absolute inset-0 flex items-center px-4 z-10">
              <div className="flex-1 flex items-center gap-2">
                <Music size={18} className="text-pink-500" />
                <span className="text-white text-sm font-medium truncate max-w-[150px] sm:max-w-xs">
                  {hasError ? 'Playlist unavailable' : playlistName}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                  }}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/40 text-white transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/40 text-white transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                  aria-label="Expand player"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          )}
          
          {/* Error Message (when expanded) */}
          {hasError && !isCollapsed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 p-4">
              <AlertCircle size={32} className="text-pink-500 mb-2" />
              <p className="text-white text-center mb-4">This playlist is unavailable</p>
              <p className="text-white/70 text-sm text-center">
                Please check your playlist settings
              </p>
            </div>
          )}
          
          {/* YouTube iframe */}
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={youtubeEmbedUrl}
            title="YouTube Music Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
        
        {/* Controls (only visible when expanded) */}
        {!isCollapsed && (
          <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              className="p-2 rounded-full bg-black/30 hover:bg-black/40 text-white transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/30 hover:bg-black/40 text-white transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
              aria-label="Collapse player"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;
