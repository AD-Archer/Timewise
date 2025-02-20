'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

const backgrounds = [
  '/images/pinkroshihouse.webp',
  '/images/pinkcatwindow.webp',
  '/images/night.webp',
  '/images/bluekit.webp',
];

interface BackgroundContextType {
  currentBackground: string;
  setBackground: (bg: string) => void;
  backgrounds: string[];
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [currentBackground, setCurrentBackground] = useState(backgrounds[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedBackground = getLocalStorage('currentBackground', backgrounds[0]);
    setCurrentBackground(savedBackground);
  }, []);

  useEffect(() => {
    if (isClient) {
      setLocalStorage('currentBackground', currentBackground);
    }
  }, [currentBackground, isClient]);

  const setBackground = (bg: string) => {
    setCurrentBackground(bg);
  };

  return (
    <BackgroundContext.Provider value={{ currentBackground, setBackground, backgrounds }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
} 