'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function useSound(soundUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(soundUrl);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.soundVolume;
    }
  }, [settings.soundVolume]);

  const play = () => {
    if (audioRef.current && settings.soundEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore errors
      });
    }
  };

  return { play };
} 