import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { PlaylistInfo } from '../contexts/SettingsContext';
import type { TimerPreset } from '../contexts/TimerContext';

// Define the Achievement interface
interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

// Define the Settings interface
interface Settings {
  durations: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
  pomodoroCount: number;
  targetPomodoros: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  playlists: PlaylistInfo[];
  currentPlaylistId: string | null;
  preferredMusicService: 'youtube' | 'spotify';
  soundEnabled: boolean;
  soundVolume: number;
  timerPresets?: TimerPreset[];
  currentPresetId?: string | null;
  achievements?: Achievement[];
  achievementsEnabled?: boolean;
  moodTrackingEnabled?: boolean;
  moodTrackingFrequency?: 'endOfSession' | 'endOfPomodoro' | 'daily' | 'manual';
  trackProductivityWithMood?: boolean;
  showMoodHistory?: boolean;
  storeMoodDataLocally?: boolean;
  chatbotEnabled?: boolean;
  chatbotProactiveSuggestions?: boolean;
  chatbotPersonality?: 'supportive' | 'direct' | 'humorous' | 'analytical';
  chatbotModel?: 'gpt-3.5-turbo' | 'gpt-4';
  customOpenAIKey?: string;
  chatExportEnabled?: boolean;
}

// Get user document reference
export const getUserDocRef = (userId: string) => {
  return doc(db, 'users', userId);
};

// Get user settings from Firestore
export const getUserSettings = async (userId: string): Promise<Settings | null> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().settings) {
      return userDoc.data().settings as Settings;
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Save user settings to Firestore
export const saveUserSettings = async (userId: string, settings: Partial<Settings>): Promise<boolean> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        settings: {
          ...userDoc.data().settings,
          ...settings,
        }
      });
    } else {
      // Create new document
      await setDoc(userDocRef, {
        settings
      });
    }
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
};

// Get user achievements from Firestore
export const getUserAchievements = async (userId: string): Promise<Achievement[] | null> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().achievements) {
      return userDoc.data().achievements as Achievement[];
    }
    return null;
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return null;
  }
};

// Save user achievements to Firestore
export const saveUserAchievements = async (userId: string, achievements: Achievement[]): Promise<boolean> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        achievements
      });
    } else {
      // Create new document
      await setDoc(userDocRef, {
        achievements
      });
    }
    return true;
  } catch (error) {
    console.error('Error saving user achievements:', error);
    return false;
  }
};

// Get user timer presets from Firestore
export const getUserTimerPresets = async (userId: string): Promise<{
  presets: TimerPreset[],
  activePresetId: string | null
} | null> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().timerPresets) {
      return {
        presets: userDoc.data().timerPresets as TimerPreset[],
        activePresetId: userDoc.data().activePresetId as string | null
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user timer presets:', error);
    return null;
  }
};

// Save user timer presets to Firestore
export const saveUserTimerPresets = async (
  userId: string, 
  presets: TimerPreset[], 
  activePresetId: string | null
): Promise<boolean> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        timerPresets: presets,
        activePresetId
      });
    } else {
      // Create new document
      await setDoc(userDocRef, {
        timerPresets: presets,
        activePresetId
      });
    }
    return true;
  } catch (error) {
    console.error('Error saving user timer presets:', error);
    return false;
  }
}; 