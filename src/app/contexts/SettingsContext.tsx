'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

interface Durations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

interface PlaylistInfo {
  id: string;
  name: string;
  url: string;
}

interface Settings {
  durations: Durations;
  pomodoroCount: number;  // Track completed pomodoros
  targetPomodoros: number;  // Number of pomodoros before long break
  autoStartBreaks: boolean;  // Auto start breaks
  autoStartPomodoros: boolean;  // Auto start next pomodoro
  playlists: PlaylistInfo[];
  currentPlaylistId: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  durations: {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  },
  pomodoroCount: 0,
  targetPomodoros: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  playlists: [],
  currentPlaylistId: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedSettings = getLocalStorage('timerSettings', defaultSettings);
    setSettings({
      ...defaultSettings,
      ...savedSettings,
      playlists: savedSettings.playlists || [],
    });
  }, []);

  useEffect(() => {
    if (isClient) {
      setLocalStorage('timerSettings', settings);
    }
  }, [settings, isClient]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      playlists: newSettings.playlists || prev.playlists || [],
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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