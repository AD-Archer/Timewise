'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { saveUserMoodData, resetUserMoodData } from '../services/userDataService';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

// Define the mood entry interface
export interface MoodEntry {
  id: string;
  date: string; // ISO string
  mood: number; // 1-5 scale
  note: string; // Optional note about the mood
  tags: string[]; // Emotion tags
}

// Define the context interface
interface MoodContextType {
  entries: MoodEntry[];
  tags: string[]; // Available tags
  addEntry: (mood: number, note: string, tags: string[]) => void;
  updateEntry: (id: string, updates: Partial<Omit<MoodEntry, 'id' | 'date'>>) => void;
  deleteEntry: (id: string) => void;
  clearAllEntries: () => void;
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  getEntriesByDateRange: (startDate: string, endDate: string) => MoodEntry[];
  getAverageMood: (startDate?: string, endDate?: string) => number | null;
}

// Default emotion tags
const defaultTags = [
  'happy', 'excited', 'grateful', 'relaxed', 'content',
  'tired', 'unsure', 'bored', 'anxious', 'angry', 
  'stressed', 'sad', 'desperate'
];

// Create the context
const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { settings } = useSettings();

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load entries and tags from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const savedEntries = getLocalStorage<MoodEntry[]>('moodEntries', []);
    const savedTags = getLocalStorage<string[]>('moodTags', defaultTags);
    
    setEntries(savedEntries);
    setTags(savedTags);
  }, [isClient]);

  // Save entries and tags to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      setLocalStorage('moodEntries', entries);
    }
  }, [entries, isClient]);

  useEffect(() => {
    if (isClient) {
      setLocalStorage('moodTags', tags);
    }
  }, [tags, isClient]);

  // Sync mood data with Firestore when entries change
  useEffect(() => {
    const syncMoodDataWithFirestore = async () => {
      // Only sync if user is logged in and storeMoodDataLocally is false
      if (user && settings && settings.storeMoodDataLocally === false) {
        try {
          // Convert MoodEntry format to UserMoodData format
          const firestoreMoodData = {
            entries: entries.map(entry => ({
              timestamp: new Date(entry.date).getTime(),
              mood: entry.mood,
              notes: entry.note,
              tags: entry.tags // Include tags in the Firestore data
            }))
          };
          
          await saveUserMoodData(user.uid, firestoreMoodData);
        } catch (error) {
          console.error('Error syncing mood data with Firestore:', error);
        }
      }
    };

    syncMoodDataWithFirestore();
  }, [entries, user, settings]);

  // Sync all local entries to Firestore when user signs in or changes storage preference
  useEffect(() => {
    const syncAllLocalEntriesToFirestore = async () => {
      // Only sync if user is logged in and storeMoodDataLocally is false
      if (user && settings && settings.storeMoodDataLocally === false && entries.length > 0) {
        try {
          // Convert all local MoodEntry format to UserMoodData format
          const firestoreMoodData = {
            entries: entries.map(entry => ({
              timestamp: new Date(entry.date).getTime(),
              mood: entry.mood,
              notes: entry.note,
              tags: entry.tags // Include tags in the Firestore data
            }))
          };
          
          await saveUserMoodData(user.uid, firestoreMoodData);
          console.log('Synced all local mood entries to Firestore');
        } catch (error) {
          console.error('Error syncing all local mood entries to Firestore:', error);
        }
      }
    };

    syncAllLocalEntriesToFirestore();
  }, [user, settings?.storeMoodDataLocally, entries]);

  // Add a new mood entry
  const addEntry = (mood: number, note: string, tags: string[] = []) => {
    try {
      // Generate a random string to ensure uniqueness
      const randomStr = Math.random().toString(36).substring(2, 8);
      const newEntry: MoodEntry = {
        id: `mood-${Date.now()}-${randomStr}`, // Generate a unique ID with timestamp and random string
        date: new Date().toISOString(),
        mood,
        note,
        tags,
      };
      
      setEntries(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Error adding mood entry:', error);
    }
  };

  // Update an existing entry
  const updateEntry = (id: string, updates: Partial<Omit<MoodEntry, 'id' | 'date'>>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates } 
          : entry
      )
    );
  };

  // Delete an entry
  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  // Clear all entries - completely rewritten for reliability
  const clearAllEntries = () => {
    if (window.confirm('Are you sure you want to delete ALL mood entries? This cannot be undone and will remove thousands of entries.')) {
      try {
        // 1. Clear entries from state immediately
        setEntries([]);
        
        // 2. Clear entries from localStorage immediately
        setLocalStorage('moodEntries', []);
        console.log('Cleared all mood entries from localStorage');
        
        // 3. If user is logged in, clear from Firestore directly
        if (user) {
          // Use the specialized function to completely reset mood data
          resetUserMoodData(user.uid)
            .then(() => {
              console.log('Successfully reset all mood entries in Firestore database');
              // Show confirmation alert after successful database clear
              alert('Successfully cleared all mood entries from the database');
            })
            .catch(error => {
              console.error('Failed to clear mood entries from Firestore:', error);
              alert('Error clearing entries from database. Please try again or contact support.');
              
              // Fallback to the old method if the reset fails
              const emptyMoodData = { entries: [] };
              return saveUserMoodData(user.uid, emptyMoodData);
            });
        }
      } catch (error) {
        console.error('Error in clearAllEntries:', error);
        alert('An error occurred while clearing entries. Please try again.');
      }
    }
  };

  // Add a new tag
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  // Delete a tag
  const deleteTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // Get entries within a date range
  const getEntriesByDateRange = (startDate: string, endDate: string) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  };

  // Get average mood (optionally within a date range)
  const getAverageMood = (startDate?: string, endDate?: string) => {
    let filteredEntries = entries;
    
    if (startDate && endDate) {
      filteredEntries = getEntriesByDateRange(startDate, endDate);
    }
    
    if (filteredEntries.length === 0) {
      return null;
    }
    
    const sum = filteredEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return sum / filteredEntries.length;
  };

  return (
    <MoodContext.Provider 
      value={{ 
        entries, 
        tags,
        addEntry, 
        updateEntry, 
        deleteEntry,
        clearAllEntries,
        addTag,
        deleteTag,
        getEntriesByDateRange,
        getAverageMood
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

// Custom hook to use the mood context
export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
} 