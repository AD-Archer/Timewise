'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Custom hook to manage audio playback.
 * 
 * @param soundUrl - The URL of the sound file to be played.
 * @returns An object containing the play function to start audio playback.
 */

export function useSound(soundUrl: string) {
  // Reference to the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Access the settings from the context, including sound volume and enabled state
  const { settings } = useSettings();

  useEffect(() => {
    // Create a new Audio object when the component mounts
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(soundUrl);
    }
    // Cleanup function to pause and nullify the audio reference when the component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]); // Re-run effect if the soundUrl changes

  useEffect(() => {
    // Update the audio volume whenever the soundVolume in settings changes
    if (audioRef.current) {
      audioRef.current.volume = settings.soundVolume;
    }
  }, [settings.soundVolume]); // Re-run effect if soundVolume changes

  /**
   * Function to play the audio.
   * Resets the current time to 0 and plays the audio if sound is enabled.
   */
  const play = () => {
    if (audioRef.current && settings.soundEnabled) {
      audioRef.current.currentTime = 0; // Reset to the start
      audioRef.current.play().catch(() => {
        // Ignore errors (e.g., if the user has not interacted with the page)
      });
    }
  };

  // Return the play function to be used in components
  return { play };
} 