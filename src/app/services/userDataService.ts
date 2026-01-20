import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Types for user data
export interface UserSettings {
  durations: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
  pomodoroCount: number;
  targetPomodoros: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  playlists: Playlist[];
  currentPlaylistId: string | null;
  preferredMusicService: 'youtube' | 'spotify';
  soundEnabled: boolean;
  soundVolume: number;
  moodTrackingEnabled?: boolean;
  moodTrackingFrequency?: string;
  trackProductivityWithMood?: boolean;
  showMoodHistory?: boolean;
  storeMoodDataLocally?: boolean;
  chatbotEnabled?: boolean;
  chatbotProactiveSuggestions?: boolean;
  chatbotPersonality?: string;
  chatbotModel?: 'gemini-2.5-flash-lite' | 'gemini-1.5-pro';
  customGeminiKey?: string;
  chatExportEnabled?: boolean;
  timerPresets?: Array<{
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
  }>;
  currentPresetId?: string | null;
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
  achievementsEnabled?: boolean;
}

// Define types for playlists
interface Playlist {
  id: string;
  name: string;
  videos: string[];
}

interface DailyStat {
  date: string;
  completedPomodoros: number;
  totalFocusTime: number;
  mood?: number;
  productivity?: number;
}

interface UserAnalytics {
  totalPomodoros: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  dailyStats: DailyStat[];
}

interface MoodEntry {
  timestamp: number;
  mood: number;
  productivity?: number;
  notes?: string;
  tags?: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface UserMoodData {
  entries: MoodEntry[];
}

interface UserData {
  settings?: UserSettings;
  analytics?: UserAnalytics;
  moodData?: UserMoodData;
  chatHistory?: ChatMessage[];
}

// Save user data to Firestore
export const saveUserData = async (userId: string, data: UserData): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing document - use a more specific approach instead of passing data directly
      // This avoids the AddPrefixToKeys type error
      if (data.settings) {
        await updateDoc(userDocRef, { settings: data.settings });
      }
      if (data.analytics) {
        await updateDoc(userDocRef, { analytics: data.analytics });
      }
      if (data.moodData) {
        await updateDoc(userDocRef, { moodData: data.moodData });
      }
    } else {
      // Create new document
      await setDoc(userDocRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Load user data from Firestore
export const loadUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
};

// Save specific settings to Firestore
export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  await saveUserData(userId, { settings });
};

// Save analytics to Firestore
export const saveUserAnalytics = async (userId: string, analytics: UserAnalytics): Promise<void> => {
  await saveUserData(userId, { analytics });
};

// Save mood data to Firestore
export const saveUserMoodData = async (userId: string, moodData: UserMoodData): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // First check if the document exists
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Force complete overwrite of the moodData field
      await updateDoc(userDocRef, { 
        moodData: moodData,
        updatedAt: new Date()
      });
      
      console.log(`Mood data saved to Firestore: ${moodData.entries.length} entries`);
    } else {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, {
        moodData: moodData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Created new user document with ${moodData.entries.length} mood entries`);
    }
  } catch (error) {
    console.error('Error saving mood data to Firestore:', error);
    throw error;
  }
};

// Save chat history to Firestore
export const saveUserChatHistory = async (userId: string, chatHistory: ChatMessage[]): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // First check if the document exists
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Force complete overwrite of the chatHistory field
      await updateDoc(userDocRef, { 
        chatHistory: chatHistory,
        updatedAt: new Date()
      });
      
      console.log(`Chat history saved to Firestore: ${chatHistory.length} messages`);
    } else {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, {
        chatHistory: chatHistory,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Created new user document with ${chatHistory.length} chat messages`);
    }
  } catch (error) {
    console.error('Error saving chat history to Firestore:', error);
    throw error;
  }
};

// Completely reset mood data in Firestore (for clearing thousands of entries)
export const resetUserMoodData = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Get the current user document
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Create a new document without the moodData field
      const userData = userDoc.data();
      
      // Set moodData to an empty object with empty entries array
      const updatedData = {
        ...userData,
        moodData: {
          entries: []
        },
        updatedAt: new Date()
      };
      
      // Completely replace the document
      await setDoc(userDocRef, updatedData);
      
      console.log('Successfully reset mood data in Firestore');
    } else {
      console.warn('User document not found when trying to reset mood data');
    }
  } catch (error) {
    console.error('Error resetting mood data in Firestore:', error);
    throw error;
  }
}; 