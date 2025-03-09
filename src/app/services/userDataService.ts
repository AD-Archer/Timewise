import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Types for user data
interface UserSettings {
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
  chatbotModel?: string;
  customOpenAIKey?: string;
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

interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
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
}

interface UserMoodData {
  entries: MoodEntry[];
}

interface UserData {
  settings?: UserSettings;
  analytics?: UserAnalytics;
  moodData?: UserMoodData;
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
  await saveUserData(userId, { moodData });
}; 