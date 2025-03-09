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
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(false);
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
          // Check if we recently deleted the last entry
          const lastEntryDeletedTimestamp = getLocalStorage<number>('last-entry-deleted-timestamp', 0);
          const currentTime = Date.now();
          const timeSinceLastEntryDeleted = currentTime - lastEntryDeletedTimestamp;
          
          // If we deleted the last entry within the last 10 seconds, skip syncing
          if (lastEntryDeletedTimestamp > 0 && timeSinceLastEntryDeleted < 10000) {
            console.log(`Skipping Firestore sync because last entry was deleted ${timeSinceLastEntryDeleted}ms ago`);
            return;
          }
          
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
  }, [entries, user, settings]);

  // Sync all local entries to Firestore when user signs in or changes storage preference
  useEffect(() => {
    const syncAllLocalEntriesToFirestore = async () => {
      // Only sync if user is logged in and storeMoodDataLocally is false
      if (user && settings && settings.storeMoodDataLocally === false && entries.length > 0) {
        try {
          // Check if we recently deleted the last entry
          const lastEntryDeletedTimestamp = getLocalStorage<number>('last-entry-deleted-timestamp', 0);
          const currentTime = Date.now();
          const timeSinceLastEntryDeleted = currentTime - lastEntryDeletedTimestamp;
          
          // If we deleted the last entry within the last 10 seconds, skip syncing
          if (lastEntryDeletedTimestamp > 0 && timeSinceLastEntryDeleted < 10000) {
            console.log(`Skipping full Firestore sync because last entry was deleted ${timeSinceLastEntryDeleted}ms ago`);
            return;
          }
          
          console.log(`Syncing all ${entries.length} local mood entries to Firestore...`);
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
          console.log(`Successfully synced all ${entries.length} local mood entries to Firestore`);
        } catch (error) {
          console.error('Error syncing all local mood entries to Firestore:', error);
        }
      }
    };

    // Only run this when user or settings change, not on every entries change
    if (user && settings && settings.storeMoodDataLocally === false) {
      syncAllLocalEntriesToFirestore();
    }
  }, [user, settings, settings?.storeMoodDataLocally]);

  // Load mood data from Firestore when user signs in
  useEffect(() => {
    const loadMoodDataFromFirestore = async () => {
      if (user && settings && settings.storeMoodDataLocally === false) {
        try {
          setIsLoading(true);
          console.log('Loading mood data from Firestore...');
          
          // Check if we recently deleted the last entry
          const lastEntryDeletedTimestamp = getLocalStorage<number>('last-entry-deleted-timestamp', 0);
          const currentTime = Date.now();
          const timeSinceLastEntryDeleted = currentTime - lastEntryDeletedTimestamp;
          
          // If we deleted the last entry within the last 10 seconds, skip loading
          if (lastEntryDeletedTimestamp > 0 && timeSinceLastEntryDeleted < 10000) {
            console.log(`Skipping Firestore load because last entry was deleted ${timeSinceLastEntryDeleted}ms ago`);
            setIsLoading(false);
            return;
          }
          
          // If it's been more than 10 seconds, clear the flag
          if (lastEntryDeletedTimestamp > 0 && timeSinceLastEntryDeleted >= 10000) {
            localStorage.removeItem('last-entry-deleted-timestamp');
          }
          
          const userData = await loadUserData(user.uid);
          
          if (userData && userData.moodData && userData.moodData.entries) {
            console.log(`Found ${userData.moodData.entries.length} mood entries in Firestore`);
            
            // Create a map of existing entries by timestamp for faster lookup
            const existingEntriesMap = new Map();
            entries.forEach(entry => {
              existingEntriesMap.set(new Date(entry.date).getTime(), true);
            });
            
            // Get all deletion markers from localStorage
            const allKeys = Object.keys(localStorage);
            const deletionMarkers = allKeys.filter(key => key.startsWith('deleted-mood-'));
            const deletedTimestamps = new Set();
            
            // Extract timestamps from deletion markers
            deletionMarkers.forEach(marker => {
              const parts = marker.split('-');
              if (parts.length >= 3) {
                const timestamp = parts[2];
                if (!isNaN(Number(timestamp))) {
                  deletedTimestamps.add(Number(timestamp));
                }
              }
            });
            
            console.log(`Found ${deletedTimestamps.size} deletion markers`);
            
            const newEntries: MoodEntry[] = [];
            
            userData.moodData.entries.forEach(entry => {
              if (!entry || !entry.timestamp) return;
              
              // Skip if this entry already exists locally
              if (existingEntriesMap.has(entry.timestamp)) return;
              
              // Skip if this entry has been deleted
              if (deletedTimestamps.has(entry.timestamp)) {
                console.log(`Skipping previously deleted entry with timestamp ${entry.timestamp}`);
                return;
              }
              
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
              console.log(`Adding ${newEntries.length} new entries from Firestore`);
              setEntries(prev => [...prev, ...newEntries]);
            } else {
              console.log('No new entries to add from Firestore');
            }
          } else {
            console.log('No mood data found in Firestore');
          }
        } catch (error) {
          console.error('Error loading mood data from Firestore:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadMoodDataFromFirestore();
  }, [user, settings?.storeMoodDataLocally]);

  // Cleanup old deletion markers (run once a day)
  useEffect(() => {
    if (!isClient) return;
    
    const cleanupDeletionMarkers = () => {
      try {
        // Get all deletion markers from localStorage
        const allKeys = Object.keys(localStorage);
        const deletionMarkers = allKeys.filter(key => key.startsWith('deleted-mood-'));
        
        if (deletionMarkers.length > 100) {
          console.log(`Cleaning up ${deletionMarkers.length - 50} old deletion markers`);
          
          // Sort by timestamp (newest first)
          deletionMarkers.sort((a, b) => {
            const timestampA = Number(a.split('-')[2]);
            const timestampB = Number(b.split('-')[2]);
            return timestampB - timestampA;
          });
          
          // Keep only the 50 most recent markers
          const markersToRemove = deletionMarkers.slice(50);
          
          // Remove old markers
          markersToRemove.forEach(marker => {
            localStorage.removeItem(marker);
          });
          
          console.log(`Removed ${markersToRemove.length} old deletion markers`);
        }
      } catch (error) {
        console.error('Error cleaning up deletion markers:', error);
      }
    };
    
    // Run cleanup on initial load
    cleanupDeletionMarkers();
    
    // Set up interval to run cleanup once a day
    const intervalId = setInterval(cleanupDeletionMarkers, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [isClient]);

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
    try {
      console.log(`Deleting mood entry with ID: ${id}`);
      
      // Get the entry being deleted for potential Firestore sync
      const entryToDelete = entries.find(entry => entry.id === id);
      
      // Check if this is the last entry
      const isLastEntry = entries.length === 1;
      
      // Remove from local state
      setEntries(prev => {
        const filtered = prev.filter(entry => entry.id !== id);
        console.log(`Removed entry from state. Entries count before: ${prev.length}, after: ${filtered.length}`);
        return filtered;
      });
      
      // If user is logged in and not storing locally, sync deletion with Firestore
      if (user && settings && settings.storeMoodDataLocally === false && entryToDelete) {
        const entryTimestamp = new Date(entryToDelete.date).getTime();
        const deletionMarker = `deleted-mood-${entryTimestamp}`;
        setLocalStorage(deletionMarker, true);
        
        // Special handling for last entry
        if (isLastEntry) {
          console.log('Last entry deleted - ensuring complete Firestore reset');
          
          // For the last entry, completely reset Firestore data to prevent any sync issues
          setTimeout(async () => {
            try {
              // Use empty entries array to completely reset
              const emptyMoodData = { entries: [] };
              await saveUserMoodData(user.uid, emptyMoodData);
              console.log('Successfully reset Firestore data after deleting last entry');
              
              // Set a special flag to prevent auto-reloading data
              setLocalStorage('last-entry-deleted-timestamp', Date.now());
            } catch (error) {
              console.error('Error resetting Firestore data after deleting last entry:', error);
            }
          }, 500);
        } else {
          // Normal deletion for non-last entries
          setTimeout(async () => {
            try {
              // Get current Firestore data
              const userData = await loadUserData(user.uid);
              
              if (userData && userData.moodData && userData.moodData.entries) {
                // Filter out the deleted entry by matching timestamp
                const updatedEntries = userData.moodData.entries.filter(
                  entry => entry.timestamp !== entryTimestamp
                );
                
                // Save the updated entries back to Firestore
                await saveUserMoodData(user.uid, { entries: updatedEntries });
                console.log(`Successfully synced deletion to Firestore. Removed entry with timestamp ${entryTimestamp}`);
              }
            } catch (error) {
              console.error('Error syncing deletion with Firestore:', error);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
    }
  };

  // Clear all entries - completely rewritten for reliability
  const clearAllEntries = () => {
    if (window.confirm('Are you sure you want to delete ALL mood entries? This cannot be undone and will remove thousands of entries.')) {
      try {
        // Make a copy of all entries before clearing them
        const allEntries = [...entries];
        
        // 1. Clear entries from state immediately
        setEntries([]);
        
        // 2. Clear entries from localStorage immediately
        setLocalStorage('moodEntries', []);
        console.log('Cleared all mood entries from localStorage');
        
        // 3. Set the last-entry-deleted flag to prevent immediate reloading
        setLocalStorage('last-entry-deleted-timestamp', Date.now());
        console.log('Set last-entry-deleted flag to prevent immediate reloading');
        
        // 4. Create deletion markers for all entries to prevent them from being re-added
        if (allEntries.length > 0) {
          console.log(`Creating deletion markers for ${allEntries.length} entries`);
          allEntries.forEach(entry => {
            const entryTimestamp = new Date(entry.date).getTime();
            const deletionMarker = `deleted-mood-${entryTimestamp}`;
            setLocalStorage(deletionMarker, true);
          });
        }
        
        // 5. If user is logged in, clear from Firestore directly
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
        } else {
          // If not using Firestore, show confirmation immediately
          alert('Successfully cleared all mood entries');
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
        isLoading,
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