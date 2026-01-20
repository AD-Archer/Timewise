'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { getUserTimerPresets, saveUserTimerPresets } from '../firebase/firestore';

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
  timeLeft: number;
  isRunning: boolean;
  currentMode: 'pomodoro' | 'shortBreak' | 'longBreak';
  setCurrentMode: React.Dispatch<React.SetStateAction<'pomodoro' | 'shortBreak' | 'longBreak'>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  addPreset: (preset: Omit<TimerPreset, 'id'>) => string;
  updatePreset: (id: string, preset: Partial<Omit<TimerPreset, 'id'>>) => void;
  deletePreset: (id: string) => void;
  applyPreset: (id: string) => void;
  saveCurrentAsPreset: (name: string) => void;
}

// Create the context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Default presets - moved outside component to prevent recreation
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
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [lastSettingsUpdate, setLastSettingsUpdate] = useState<string | null>(null);
  
  // Use refs to track current values for stable access in effects
  const presetsRef = useRef(presets);
  const activePresetIdRef = useRef(activePresetId);
  const isApplyingPresetRef = useRef(false);
  const isLoadingPresetsRef = useRef(false);
  
  // Update refs when state changes
  useEffect(() => {
    presetsRef.current = presets;
  }, [presets]);
  
  useEffect(() => {
    activePresetIdRef.current = activePresetId;
  }, [activePresetId]);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load presets from Firestore if user is logged in, otherwise from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const loadPresets = async () => {
      try {
        isLoadingPresetsRef.current = true;
        
        if (user) {
          // Try to load from Firestore first
          const firestoreData = await getUserTimerPresets(user.uid);
          
          if (firestoreData) {
            // Make sure we always have the default presets
            const mergedPresets = [...firestoreData.presets];
            
            // Add default presets if they don't exist in saved presets
            defaultPresets.forEach(defaultPreset => {
              if (!mergedPresets.some(p => p.id === defaultPreset.id)) {
                mergedPresets.push(defaultPreset);
              }
            });
            
            setPresets(mergedPresets);
            
            // Check if activePresetId has been cleared in localStorage
            const localActivePresetId = localStorage.getItem('activePresetId');
            if (localActivePresetId === null) {
              setActivePresetId(null);
            } else {
              setActivePresetId(firestoreData.activePresetId);
            }
            return;
          }
        }
        
        // Fall back to localStorage if not logged in or no Firestore data
        const savedPresets = getLocalStorage<TimerPreset[]>('timerPresets', defaultPresets);
        
        // Check if activePresetId has been cleared in localStorage
        const localActivePresetId = localStorage.getItem('activePresetId');
        if (localActivePresetId === null) {
          setActivePresetId(null);
        } else {
          const savedActivePresetId = getLocalStorage<string | null>('activePresetId', 'default');
          setActivePresetId(savedActivePresetId);
        }
        
        // Make sure we always have the default presets
        const mergedPresets = [...savedPresets];
        
        // Add default presets if they don't exist in saved presets
        defaultPresets.forEach(defaultPreset => {
          if (!mergedPresets.some(p => p.id === defaultPreset.id)) {
            mergedPresets.push(defaultPreset);
          }
        });
        
        setPresets(mergedPresets);
      } catch (error) {
        console.error('Error loading timer presets:', error);
        setPresets(defaultPresets);
        setActivePresetId('default');
      } finally {
        // Clear loading flag after a delay to allow state updates to settle
        setTimeout(() => {
          isLoadingPresetsRef.current = false;
        }, 200);
      }
    };
    
    loadPresets();
  }, [isClient, user]);

  // Save presets to Firestore if user is logged in, otherwise to localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const savePresets = async () => {
      try {
        if (user) {
          // Save to Firestore if user is logged in
          await saveUserTimerPresets(user.uid, presets, activePresetId);
        } else {
          // Save to localStorage if not logged in
          setLocalStorage('timerPresets', presets);
          setLocalStorage('activePresetId', activePresetId);
        }
      } catch (error) {
        console.error('Error saving timer presets:', error);
      }
    };
    
    savePresets();
  }, [presets, activePresetId, isClient, user]);

  // Track settings changes to detect manual updates
  useEffect(() => {
    if (!isClient) return;
    
    // Skip if we're currently applying a preset or loading presets
    if (isApplyingPresetRef.current || isLoadingPresetsRef.current) return;
    
    // Get a string representation of the current settings
    const currentSettingsString = JSON.stringify({
      durations: settings.durations,
      targetPomodoros: settings.targetPomodoros,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartPomodoros: settings.autoStartPomodoros,
    });
    
    // If this is the first settings load, just save it
    if (lastSettingsUpdate === null) {
      setLastSettingsUpdate(currentSettingsString);
      return;
    }
    
    // If settings changed and we have an active preset, check if it matches the preset
    const currentActivePresetId = activePresetIdRef.current;
    if (currentActivePresetId && currentSettingsString !== lastSettingsUpdate) {
      const activePreset = presetsRef.current.find(p => p.id === currentActivePresetId);
      
      if (activePreset) {
        const presetSettingsString = JSON.stringify({
          durations: activePreset.durations,
          targetPomodoros: activePreset.targetPomodoros,
          autoStartBreaks: activePreset.autoStartBreaks,
          autoStartPomodoros: activePreset.autoStartPomodoros,
        });
        
        // If settings don't match the active preset, clear the active preset
        if (currentSettingsString !== presetSettingsString) {
          console.log('Settings changed manually, clearing active preset');
          setActivePresetId(null);
          // Signal to Timer component that settings were manually changed
          localStorage.setItem('manualSettingsChange', Date.now().toString());
        }
      }
    }
    
    // Update the last settings string
    setLastSettingsUpdate(currentSettingsString);
  }, [settings, isClient, lastSettingsUpdate]); // Add lastSettingsUpdate back

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
    
    // Set flag to prevent settings tracking during preset application
    isApplyingPresetRef.current = true;
    
    setActivePresetId(id);
    
    // Update the settings with the preset values
    updateSettings({
      durations: preset.durations,
      targetPomodoros: preset.targetPomodoros,
      autoStartBreaks: preset.autoStartBreaks,
      autoStartPomodoros: preset.autoStartPomodoros,
    });
    
    // Clear the flag after a short delay to allow settings to update
    setTimeout(() => {
      isApplyingPresetRef.current = false;
    }, 100);
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
    
    // Set flag to prevent settings tracking during preset application
    isApplyingPresetRef.current = true;
    setActivePresetId(newId);
    
    // Clear the flag after a short delay
    setTimeout(() => {
      isApplyingPresetRef.current = false;
    }, 100);
  };

  return (
    <TimerContext.Provider 
      value={{ 
        presets, 
        activePresetId, 
        timeLeft,
        isRunning,
        currentMode,
        setCurrentMode,
        setTimeLeft,
        setIsRunning,
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