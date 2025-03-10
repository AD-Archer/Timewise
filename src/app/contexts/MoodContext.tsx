'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { saveUserMoodData, resetUserMoodData, loadUserData } from '../services/userDataService';
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
  isLoading: boolean; // Loading state for Firestore operations
  requiresAuth: boolean; // Whether the user needs to sign in
  addEntry: (mood: number, note: string, tags: string[]) => void;
  updateEntry: (id: string, updates: Partial<Omit<MoodEntry, 'id' | 'date'>>) => void;
  deleteEntry: (id: string) => void;
  clearAllEntries: () => void;
  resetClearFlag: () => void; // New function to reset the clear flag
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { settings } = useSettings();
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    if (isClient) {
      setRequiresAuth(!user);
    }
  }, [user, isClient]);

  // Load entries and tags from Firestore only
  useEffect(() => {
    if (!isClient) return;
    
    // If user is not authenticated, don't load any data
    if (!user) {
      setEntries([]);
      setTags(defaultTags);
      setIsLoading(false);
      return;
    }
    
    // Load tags from localStorage (we'll still keep tags in localStorage for simplicity)
    const savedTags = getLocalStorage<string[]>('moodTags', defaultTags);
    setTags(savedTags);
    
    // Data will be loaded from Firestore in the loadMoodDataFromFirestore effect
    
  }, [isClient, user]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      setLocalStorage('moodTags', tags);
    }
  }, [tags, isClient]);

  // Sync mood data with Firestore when entries change
  useEffect(() => {
    const syncMoodDataWithFirestore = async () => {
      // Only sync if user is logged in
      if (user && entries.length > 0) {
        try {
          console.log('Syncing mood data with Firestore...');
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
          console.log(`Successfully synced ${firestoreMoodData.entries.length} mood entries to Firestore`);
        } catch (error) {
          console.error('Error syncing mood data with Firestore:', error);
        }
      }
    };

    // Debounce the sync to avoid too many Firestore writes
    const timeoutId = setTimeout(() => {
      syncMoodDataWithFirestore();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [entries, user]);

  // Load mood data from Firestore when user signs in
  useEffect(() => {
    const loadMoodDataFromFirestore = async () => {
      if (user) {
        try {
          setIsLoading(true);
          console.log('Loading mood data from Firestore...');
          
          // Check if all entries were cleared
          const allEntriesClearedTimestamp = getLocalStorage<number>('all-entries-cleared-timestamp', 0);
          const deletedAllEntries = getLocalStorage<boolean>('deleted-all-entries', false);
          
          // If we have a "all entries cleared" flag, don't load any entries from Firestore
          if (allEntriesClearedTimestamp > 0 || deletedAllEntries) {
            console.log('All entries were previously cleared, skipping Firestore load');
            setIsLoading(false);
            return;
          }
          
          const userData = await loadUserData(user.uid);
          
          if (userData && userData.moodData && userData.moodData.entries) {
            console.log(`Found ${userData.moodData.entries.length} mood entries in Firestore`);
            
            const newEntries: MoodEntry[] = [];
            
            userData.moodData.entries.forEach(entry => {
              if (!entry || !entry.timestamp) return;
              
              // Convert Firestore entry to MoodEntry format
              const newEntry: MoodEntry = {
                id: `mood-${entry.timestamp}-${Math.random().toString(36).substring(2, 8)}`,
                date: new Date(entry.timestamp).toISOString(),
                mood: entry.mood || 3,
                note: entry.notes || '',
                tags: entry.tags || []
              };
              
              newEntries.push(newEntry);
            });
            
            if (newEntries.length > 0) {
              console.log(`Adding ${newEntries.length} entries from Firestore`);
              
              // Use removeDuplicateEntries to ensure no duplicates
              setEntries(removeDuplicateEntries(newEntries));
            } else {
              console.log('No entries found in Firestore');
              setEntries([]);
            }
          } else {
            console.log('No mood data found in Firestore');
            setEntries([]);
          }
        } catch (error) {
          console.error('Error loading mood data from Firestore:', error);
          setEntries([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadMoodDataFromFirestore();
  }, [user]);

  // Helper function to remove duplicate entries
  const removeDuplicateEntries = (entries: MoodEntry[]): MoodEntry[] => {
    // Use a Map to track entries by timestamp
    const entriesByTimestamp = new Map<number, MoodEntry>();
    
    // Process entries in reverse order (newest first)
    // This ensures we keep the newest entry when duplicates exist
    [...entries].reverse().forEach(entry => {
      const timestamp = new Date(entry.date).getTime();
      
      // Only add this entry if we haven't seen this timestamp yet
      if (!entriesByTimestamp.has(timestamp)) {
        entriesByTimestamp.set(timestamp, entry);
      }
    });
    
    // Convert back to array and sort by date (oldest first)
    return Array.from(entriesByTimestamp.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Add a new mood entry
  const addEntry = (mood: number, note: string, tags: string[] = []) => {
    if (!user) {
      alert('You need to sign in to track your mood');
      return;
    }
    
    try {
      // Generate a timestamp for the new entry
      const timestamp = Date.now();
      
      // Check if an entry with this timestamp already exists
      const entryExists = entries.some(entry => {
        const entryTimestamp = new Date(entry.date).getTime();
        // Allow 1 second tolerance for timestamp comparison
        return Math.abs(entryTimestamp - timestamp) < 1000;
      });
      
      if (entryExists) {
        console.log('Prevented duplicate entry - an entry with this timestamp already exists');
        return;
      }
      
      // Generate a random string to ensure uniqueness
      const randomStr = Math.random().toString(36).substring(2, 8);
      const newEntry: MoodEntry = {
        id: `mood-${timestamp}-${randomStr}`, // Generate a unique ID with timestamp and random string
        date: new Date(timestamp).toISOString(),
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
    if (!user) {
      alert('You need to sign in to update mood entries');
      return;
    }
    
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
    if (!user) {
      alert('You need to sign in to delete mood entries');
      return;
    }
    
    try {
      console.log(`Deleting mood entry with ID: ${id}`);
      
      // Remove from state
      setEntries(prev => {
        const filtered = prev.filter(entry => entry.id !== id);
        console.log(`Removed entry from state. Entries count before: ${prev.length}, after: ${filtered.length}`);
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting mood entry:', error);
    }
  };

  // Clear all entries
  const clearAllEntries = () => {
    if (!user) {
      alert('You need to sign in to clear mood entries');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete ALL mood entries? This cannot be undone and will remove thousands of entries.')) {
      try {
        // Clear entries from state immediately
        setEntries([]);
        
        // Set flags to prevent reloading
        setLocalStorage('all-entries-cleared-timestamp', Date.now());
        setLocalStorage('deleted-all-entries', true);
        
        // Reset Firestore data
        resetUserMoodData(user.uid)
          .then(() => {
            console.log('Successfully reset all mood entries in Firestore database');
            alert('Successfully cleared all mood entries from the database');
            
            // Force a page reload to ensure everything is cleared
            window.location.reload();
          })
          .catch(error => {
            console.error('Failed to clear mood entries from Firestore:', error);
            alert('Error clearing entries from database. Please try again or contact support.');
          });
      } catch (error) {
        console.error('Error in clearAllEntries:', error);
        alert('An error occurred while clearing entries. Please try again.');
      }
    }
  };

  // Reset the "all entries cleared" flag
  const resetClearFlag = () => {
    if (!user) {
      alert('You need to sign in to reset mood tracking');
      return;
    }
    
    setLocalStorage('all-entries-cleared-timestamp', 0);
    setLocalStorage('deleted-all-entries', false);
    setEntries([]);
    setTags(defaultTags);
    console.log('All entries cleared flag reset');
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
        isLoading,
        requiresAuth,
        addEntry, 
        updateEntry, 
        deleteEntry,
        clearAllEntries,
        resetClearFlag,
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