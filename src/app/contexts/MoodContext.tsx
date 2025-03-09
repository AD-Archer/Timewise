'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

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

  // Add a new mood entry
  const addEntry = (mood: number, note: string, tags: string[] = []) => {
    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}`, // Generate a unique ID
      date: new Date().toISOString(),
      mood,
      note,
      tags,
    };
    
    setEntries(prev => [...prev, newEntry]);
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