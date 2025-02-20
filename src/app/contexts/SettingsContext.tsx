'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

interface Durations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

interface SettingsContextType {
  durations: Durations;
  setDurations: (durations: Durations) => void;
}

const defaultDurations: Durations = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 10 * 60,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [durations, setDurationsState] = useState(defaultDurations);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedDurations = getLocalStorage('timerDurations', defaultDurations);
    setDurationsState(savedDurations);
  }, []);

  useEffect(() => {
    if (isClient) {
      setLocalStorage('timerDurations', durations);
    }
  }, [durations, isClient]);

  const setDurations = (newDurations: Durations) => {
    setDurationsState(newDurations);
  };

  return (
    <SettingsContext.Provider value={{ durations, setDurations }}>
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