/**
 * I need to use this file for the spotify player to make sure that music will stop when the timer stops
 */
'use client';

import React, { createContext, useContext, useState, useRef } from 'react';


// Define the SpotifyPlayer interface for type safety
interface SpotifyPlayerInstance {
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  getCurrentState: () => Promise<{ paused: boolean } | null>;
}

// Define the interface for the MusicContext
interface MusicContextType {
  pauseMusic: () => void;
  resumeMusic: () => void;
  registerPlayer: (player: SpotifyPlayerInstance) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

// Create the context with a default undefined value
const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Provider component that wraps the app and provides the music context
export function MusicProvider({ children }: { children: React.ReactNode }) {
  // State to track if music is playing
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Reference to the Spotify player instance
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);

  // Register a player instance (from SpotifyPlayer)
  const registerPlayer = (player: SpotifyPlayerInstance) => {
    playerRef.current = player;
  };

  // Pause music playback
  const pauseMusic = async () => {
    try {
      if (playerRef.current && isPlaying) {
        await playerRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing music:', error);
    }
  };

  // Resume music playback
  const resumeMusic = async () => {
    try {
      if (playerRef.current) {
        await playerRef.current.resume();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming music:', error);
    }
  };

  // Provide the context value to children components
  return (
    <MusicContext.Provider value={{ 
      pauseMusic, 
      resumeMusic, 
      registerPlayer,
      isPlaying,
      setIsPlaying
    }}>
      {children}
    </MusicContext.Provider>
  );
}

// Custom hook to use the music context
export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 