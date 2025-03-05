'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { useSettings } from './SettingsContext';

// Define the preset interface
export interface TimerPreset {
  id: string;
  name: string;
  durations: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
  targetPomodoros: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

// Define the context interface
interface TimerContextType {
  presets: TimerPreset[];
  activePresetId: string | null;
  addPreset: (preset: Omit<TimerPreset, 'id'>) => string;
  updatePreset: (id: string, preset: Partial<Omit<TimerPreset, 'id'>>) => void;
  deletePreset: (id: string) => void;
  applyPreset: (id: string) => void;
  saveCurrentAsPreset: (name: string) => void;
}

// Create the context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Default presets
const defaultPresets: TimerPreset[] = [
  {
    id: 'default',
    name: 'Classic Pomodoro',
    durations: {
      pomodoro: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
    },
    targetPomodoros: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true,
  },
  {
    id: 'short-focus',
    name: 'Short Focus',
    durations: {
      pomodoro: 15 * 60,
      shortBreak: 3 * 60,
      longBreak: 10 * 60,
    },
    targetPomodoros: 6,
    autoStartBreaks: true,
    autoStartPomodoros: true,
  },
  {
    id: 'long-focus',
    name: 'Deep Work',
    durations: {
      pomodoro: 45 * 60,
      shortBreak: 10 * 60,
      longBreak: 20 * 60,
    },
    targetPomodoros: 3,
    autoStartBreaks: true,
    autoStartPomodoros: false,
  },
];

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const [presets, setPresets] = useState<TimerPreset[]>(defaultPresets);
  const [activePresetId, setActivePresetId] = useState<string | null>('default');
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load presets from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const savedPresets = getLocalStorage<TimerPreset[]>('timerPresets', defaultPresets);
    const savedActivePresetId = getLocalStorage<string | null>('activePresetId', 'default');
    
    // Make sure we always have the default presets
    const mergedPresets = [...savedPresets];
    
    // Add default presets if they don't exist in saved presets
    defaultPresets.forEach(defaultPreset => {
      if (!mergedPresets.some(p => p.id === defaultPreset.id)) {
        mergedPresets.push(defaultPreset);
      }
    });
    
    setPresets(mergedPresets);
    setActivePresetId(savedActivePresetId);
  }, [isClient]);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      setLocalStorage('timerPresets', presets);
      setLocalStorage('activePresetId', activePresetId);
    }
  }, [presets, activePresetId, isClient]);

  // Add a new preset
  const addPreset = (preset: Omit<TimerPreset, 'id'>) => {
    const newPreset: TimerPreset = {
      ...preset,
      id: `preset-${Date.now()}`, // Generate a unique ID
    };
    
    setPresets(prev => [...prev, newPreset]);
    return newPreset.id;
  };

  // Update an existing preset
  const updatePreset = (id: string, preset: Partial<Omit<TimerPreset, 'id'>>) => {
    // Don't allow updating default presets
    if (defaultPresets.some(p => p.id === id)) {
      console.warn('Cannot update default preset');
      return;
    }
    
    setPresets(prev => 
      prev.map(p => 
        p.id === id 
          ? { ...p, ...preset } 
          : p
      )
    );
  };

  // Delete a preset
  const deletePreset = (id: string) => {
    // Don't allow deleting default presets
    if (defaultPresets.some(p => p.id === id)) {
      console.warn('Cannot delete default preset');
      return;
    }
    
    setPresets(prev => prev.filter(p => p.id !== id));
    
    // If the active preset is deleted, set to default
    if (activePresetId === id) {
      setActivePresetId('default');
      
      // Also apply the default preset
      const defaultPreset = defaultPresets[0];
      updateSettings({
        durations: defaultPreset.durations,
        targetPomodoros: defaultPreset.targetPomodoros,
        autoStartBreaks: defaultPreset.autoStartBreaks,
        autoStartPomodoros: defaultPreset.autoStartPomodoros,
      });
    }
  };

  // Apply a preset to the current settings
  const applyPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) {
      console.warn(`Preset with id ${id} not found`);
      return;
    }
    
    setActivePresetId(id);
    
    // Update the settings with the preset values
    updateSettings({
      durations: preset.durations,
      targetPomodoros: preset.targetPomodoros,
      autoStartBreaks: preset.autoStartBreaks,
      autoStartPomodoros: preset.autoStartPomodoros,
    });
  };

  // Save current settings as a new preset
  const saveCurrentAsPreset = (name: string) => {
    const newPreset: Omit<TimerPreset, 'id'> = {
      name,
      durations: settings.durations,
      targetPomodoros: settings.targetPomodoros,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
    };
    
    const newId = addPreset(newPreset);
    setActivePresetId(newId);
  };

  return (
    <TimerContext.Provider 
      value={{ 
        presets, 
        activePresetId, 
        addPreset, 
        updatePreset, 
        deletePreset, 
        applyPreset,
        saveCurrentAsPreset
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

// Custom hook to use the timer context
export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
} 