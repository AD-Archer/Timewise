//I'm debating on having muliple settings panels, maybe 1 for the timer and 1 for the mood app.

'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

interface Durations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export interface PlaylistInfo {
  id: string;
  name: string;
  url: string;
}

// Spotify playlist interface
export interface SpotifyPlaylistInfo {
  id: string;
  name: string;
  uri: string;
  imageUrl?: string;
}

interface Settings {
  durations: Durations;
  pomodoroCount: number;  // Track completed pomodoros
  targetPomodoros: number;  // Number of pomodoros before long break
  autoStartBreaks: boolean;  // Auto start breaks
  autoStartPomodoros: boolean;  // Auto start next pomodoro
  playlists: PlaylistInfo[];
  currentPlaylistId: string | null;
  // Spotify related settings
  spotifyPlaylists: SpotifyPlaylistInfo[];
  currentSpotifyPlaylistUri: string | null;
  // Music service preference
  preferredMusicService: 'youtube' | 'spotify';
  soundEnabled: boolean;
  soundVolume: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllSettings: () => void;
}

// Default lofi study music playlist
const defaultPlaylist: PlaylistInfo = {
  id: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo',
  name: 'Lofi Study Music',
  url: 'https://youtube.com/playlist?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo',
};

const defaultSettings: Settings = {
  durations: {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  },
  pomodoroCount: 0,
  targetPomodoros: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  playlists: [defaultPlaylist],
  currentPlaylistId: defaultPlaylist.id,
  // Initialize empty Spotify playlists
  spotifyPlaylists: [],
  currentSpotifyPlaylistUri: null,
  // Default to Spotify player
  preferredMusicService: 'spotify',
  soundEnabled: true,
  soundVolume: 0.5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isClient, setIsClient] = useState(false);
  const pendingUpdateRef = useRef<Partial<Settings> | null>(null);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const savedSettings = getLocalStorage('timerSettings', defaultSettings);
    
    // Ensure we always have the default playlist available
    const mergedPlaylists = [...(savedSettings.playlists || [])];
    
    // Add default playlist if it doesn't exist in saved playlists
    if (!mergedPlaylists.some(p => p.id === defaultPlaylist.id)) {
      mergedPlaylists.push(defaultPlaylist);
    }
    
    setSettings({
      ...defaultSettings,
      ...savedSettings,
      playlists: mergedPlaylists,
      // If current playlist is null or undefined, use default
      currentPlaylistId: savedSettings.currentPlaylistId || defaultPlaylist.id,
    });
  }, [isClient]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      setLocalStorage('timerSettings', settings);
    }
  }, [settings, isClient]);

  // Handle pending updates
  useEffect(() => {
    if (pendingUpdateRef.current !== null) {
      const newSettings = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      
      setSettings(prev => ({
        ...prev,
        ...newSettings,
        playlists: newSettings.playlists || prev.playlists || [],
      }));
    }
  }, [settings.pomodoroCount]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    // For pomodoro count updates, use the ref to avoid render-time updates
    if ('pomodoroCount' in newSettings) {
      pendingUpdateRef.current = newSettings;
      return;
    }
    
    // For other settings, update immediately
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      playlists: newSettings.playlists || prev.playlists || [],
    }));
  };

  const resetAllSettings = () => {
    setSettings({
      ...defaultSettings,
      playlists: [defaultPlaylist],
      currentPlaylistId: defaultPlaylist.id,
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetAllSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 