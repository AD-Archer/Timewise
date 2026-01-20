//I'm debating on having muliple settings panels, maybe 1 for the timer and 1 for the mood app.

'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { getUserSettings, saveUserSettings } from '../firebase/firestore';
import { loadUserData, saveUserChatHistory } from '../services/userDataService';

interface Durations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export interface PlaylistInfo {
  id: string;
  name: string;
  url: string;
  videos: string[];
}

// Spotify playlist interface - not stored in Firestore
export interface SpotifyPlaylistInfo {
  id: string;
  name: string;
  uri: string;
  imageUrl?: string;
}

export interface Settings {
  durations: Durations;
  pomodoroCount: number;  // Track completed pomodoros
  targetPomodoros: number;  // Number of pomodoros before long break
  autoStartBreaks: boolean;  // Auto start breaks
  autoStartPomodoros: boolean;  // Auto start next pomodoro
  playlists: PlaylistInfo[];
  currentPlaylistId: string | null;
  // Music service preference
  preferredMusicService: 'youtube' | 'spotify';
  soundEnabled: boolean;
  soundVolume: number;
  // Chart view preferences
  pomodoroChartTimeframe?: 'week' | 'month' | 'year';
  moodChartTimeframe?: 'week' | 'month' | 'year';
  // Mood tracker settings
  moodTrackingEnabled?: boolean;
  moodTrackingFrequency?: 'endOfSession' | 'endOfPomodoro' | 'daily' | 'manual';
  trackProductivityWithMood?: boolean;
  showMoodHistory?: boolean;
  storeMoodDataLocally?: boolean;
  // Chatbot settings
  chatbotEnabled?: boolean;
  chatbotProactiveSuggestions?: boolean;
  chatbotPersonality?: 'supportive' | 'direct' | 'humorous' | 'analytical';
  chatbotModel?: 'gemini-2.5-flash-lite' | 'gemini-1.5-pro';
  customGeminiKey?: string;
  chatExportEnabled?: boolean;
  // Meditation settings
  meditationSessionHistory?: {
    type: string;
    duration: number;
    date: string;
  }[];
  favoriteSessionTypes?: string[];
  defaultMeditationDuration?: number;
}

// Chat history interface - not stored in Firestore, only in memory
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllSettings: () => void;
  // Spotify playlists - managed in memory only
  spotifyPlaylists: SpotifyPlaylistInfo[];
  currentSpotifyPlaylistUri: string | null;
  updateSpotifyPlaylists: (playlists: SpotifyPlaylistInfo[]) => void;
  setCurrentSpotifyPlaylistUri: (uri: string | null) => void;
  // Chat history - managed in memory only
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  exportChatHistory: () => void;
  isLoadingChat: boolean;
}

// Default lofi study music playlist
const defaultPlaylist: PlaylistInfo = {
  id: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo',
  name: 'Lofi Study Music',
  url: 'https://youtube.com/playlist?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo',
  videos: [],
};

const defaultSettings: Settings = {
  durations: {
    pomodoro: 25 * 60, // 25 minutes in seconds
    shortBreak: 5 * 60, // 5 minutes in seconds
    longBreak: 10 * 60, // 10 minutes in seconds
  },
  pomodoroCount: 0,
  targetPomodoros: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  playlists: [],
  currentPlaylistId: null,
  // Default to Spotify player
  preferredMusicService: 'spotify',
  soundEnabled: true,
  soundVolume: 50,
  pomodoroChartTimeframe: 'week',
  moodChartTimeframe: 'week',
  // Default mood tracker settings
  moodTrackingEnabled: true,
  moodTrackingFrequency: 'endOfSession',
  trackProductivityWithMood: true,
  showMoodHistory: true,
  storeMoodDataLocally: false,
  // Default chatbot settings
  chatbotEnabled: true,
  chatbotProactiveSuggestions: true,
  chatbotPersonality: 'supportive',
  chatbotModel: 'gemini-2.5-flash-lite',
  customGeminiKey: '',
  chatExportEnabled: true,
  // Meditation settings
  meditationSessionHistory: [],
  favoriteSessionTypes: ['breathing'],
  defaultMeditationDuration: 5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isClient, setIsClient] = useState(false);
  const pendingUpdateRef = useRef<Partial<Settings> | null>(null);
  const { user } = useAuth();
  
  // In-memory state for Spotify playlists (not stored in Firestore)
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylistInfo[]>([]);
  const [currentSpotifyPlaylistUri, setCurrentSpotifyPlaylistUri] = useState<string | null>(null);
  
  // In-memory state for chat history (not stored in Firestore)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load settings from Firestore if user is logged in, otherwise from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const loadSettings = async () => {
      try {
        if (user) {
          // Try to load from Firestore first
          const firestoreSettings = await getUserSettings(user.uid);
          
          if (firestoreSettings) {
            // Migrate old GPT models and old Gemini models to new Gemini model
            const migratedSettings: any = { ...firestoreSettings };
            if (migratedSettings.chatbotModel === 'gpt-3.5-turbo' || 
                migratedSettings.chatbotModel === 'gpt-4' ||
                migratedSettings.chatbotModel === 'gemini-1.5-flash') {
              migratedSettings.chatbotModel = 'gemini-2.5-flash-lite';
            }
            
            // Ensure we always have the default playlist available
            const mergedPlaylists = [...(migratedSettings.playlists || [])];
            
            // Add default playlist if it doesn't exist in saved playlists
            if (!mergedPlaylists.some(p => p.id === defaultPlaylist.id)) {
              mergedPlaylists.push(defaultPlaylist);
            }
            
            setSettings({
              ...defaultSettings,
              ...migratedSettings,
              playlists: mergedPlaylists,
              // If current playlist is null or undefined, use default
              currentPlaylistId: migratedSettings.currentPlaylistId || defaultPlaylist.id,
            } as Settings);
            return;
          }
        }
        
        // Fall back to localStorage if not logged in or no Firestore data
        const savedSettings = getLocalStorage('timerSettings', defaultSettings);
        
        // Migrate old GPT models and old Gemini models to new Gemini model
        const migratedSavedSettings: any = { ...savedSettings };
        if (migratedSavedSettings.chatbotModel === 'gpt-3.5-turbo' || 
            migratedSavedSettings.chatbotModel === 'gpt-4' ||
            migratedSavedSettings.chatbotModel === 'gemini-1.5-flash') {
          migratedSavedSettings.chatbotModel = 'gemini-2.5-flash-lite';
        }
        
        // Ensure we always have the default playlist available
        const mergedPlaylists = [...(migratedSavedSettings.playlists || [])];
        
        // Add default playlist if it doesn't exist in saved playlists
        if (!mergedPlaylists.some(p => p.id === defaultPlaylist.id)) {
          mergedPlaylists.push(defaultPlaylist);
        }
        
        setSettings({
          ...defaultSettings,
          ...migratedSavedSettings,
          playlists: mergedPlaylists,
          // If current playlist is null or undefined, use default
          currentPlaylistId: savedSettings.currentPlaylistId || defaultPlaylist.id,
        });
        
        // Load Spotify playlists from localStorage (not stored in Firestore)
        const savedSpotifyPlaylists = getLocalStorage<SpotifyPlaylistInfo[]>('spotifyPlaylists', []);
        const savedSpotifyUri = getLocalStorage<string | null>('currentSpotifyPlaylistUri', null);
        
        setSpotifyPlaylists(savedSpotifyPlaylists);
        setCurrentSpotifyPlaylistUri(savedSpotifyUri);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      }
    };
    
    loadSettings();
  }, [isClient, user]);

  // Load chat history from localStorage or Firestore
  useEffect(() => {
    if (!isClient) return;
    
    const loadChatHistory = async () => {
      try {
        setIsLoadingChat(true);
        
        // If user is logged in and chatExportEnabled is true, try to load from Firestore
        if (user && settings.chatExportEnabled) {
          console.log('Loading chat history from Firestore...');
          const userData = await loadUserData(user.uid);
          
          if (userData && userData.chatHistory && Array.isArray(userData.chatHistory)) {
            console.log(`Found ${userData.chatHistory.length} chat messages in Firestore`);
            
            // Convert to ChatMessage format
            const loadedMessages = userData.chatHistory.map(msg => ({
              role: msg.role || 'assistant',
              content: msg.content || '',
              timestamp: msg.timestamp || Date.now()
            }));
            
            setChatHistory(loadedMessages);
            setIsLoadingChat(false);
            return;
          } else {
            console.log('No chat history found in Firestore');
          }
        }
        
        // Fall back to localStorage
        const savedChatHistory = getLocalStorage<ChatMessage[]>('chatHistory', []);
        setChatHistory(savedChatHistory);
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fall back to empty chat history on error
        setChatHistory([]);
      } finally {
        setIsLoadingChat(false);
      }
    };
    
    loadChatHistory();
  }, [isClient, user, settings.chatExportEnabled]);

  // Update settings function with improved persistence
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    console.log('Updating settings:', newSettings);
    
    // Update settings state with new values
    setSettings(prev => {
      // Create the updated settings object
      const updatedSettings = {
        ...prev,
        ...newSettings,
        // Special handling for nested durations object
        durations: newSettings.durations 
          ? { ...prev.durations, ...newSettings.durations } 
          : prev.durations,
      } as Settings;
      
      // Immediately save to localStorage for persistence
      if (isClient) {
        setLocalStorage('timerSettings', updatedSettings);
        
        // Set a flag to indicate settings were updated
        localStorage.setItem('settingsLastUpdated', Date.now().toString());
        
        // If user is logged in, save to Firestore
        if (user) {
          saveUserSettings(user.uid, updatedSettings as any)
            .catch(error => console.error('Error saving settings to Firestore:', error));
        }
      } else {
        // If not client-side yet, store the update in ref to apply later
        pendingUpdateRef.current = newSettings;
      }
      
      return updatedSettings;
    });
  }, [isClient, user]);

  const resetAllSettings = () => {
    setSettings({
      ...defaultSettings,
      playlists: [defaultPlaylist],
      currentPlaylistId: defaultPlaylist.id,
    });
    
    // Also reset Spotify playlists
    setSpotifyPlaylists([]);
    setCurrentSpotifyPlaylistUri(null);
    
    // Clear chat history
    setChatHistory([]);
  };
  
  // Update Spotify playlists (in memory only)
  const updateSpotifyPlaylists = (playlists: SpotifyPlaylistInfo[]) => {
    setSpotifyPlaylists(playlists);
  };
  
  // Add a chat message to history (in memory only)
  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, { ...message, timestamp: message.timestamp || Date.now() }]);
  };
  
  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
  };
  
  // Export chat history as a file
  const exportChatHistory = () => {
    if (chatHistory.length === 0) {
      alert('No chat history to export');
      return;
    }
    
    try {
      // Format chat history as JSON
      const chatData = JSON.stringify(chatHistory, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([chatData], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `timewise-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      
      // Append the link to the body
      document.body.appendChild(link);
      
      // Click the link to trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chat history:', error);
      alert('Failed to export chat history');
    }
  };

  // Save Spotify playlists to localStorage only (not to Firestore)
  useEffect(() => {
    if (!isClient) return;
    
    setLocalStorage('spotifyPlaylists', spotifyPlaylists);
    setLocalStorage('currentSpotifyPlaylistUri', currentSpotifyPlaylistUri);
  }, [spotifyPlaylists, currentSpotifyPlaylistUri, isClient]);

  // Save chat history to localStorage and Firestore when it changes
  useEffect(() => {
    if (!isClient) return;
    
    // Always save to localStorage
    setLocalStorage('chatHistory', chatHistory);
    
    // If user is logged in and chatExportEnabled is true, also save to Firestore
    if (user && settings.chatExportEnabled && chatHistory.length > 0) {
      const saveToFirestore = async () => {
        try {
          console.log('Saving chat history to Firestore...');
          await saveUserChatHistory(user.uid, chatHistory);
          console.log(`Successfully saved ${chatHistory.length} chat messages to Firestore`);
        } catch (error) {
          console.error('Error saving chat history to Firestore:', error);
        }
      };
      
      // Increased debounce time to 5 seconds to prevent write exhaustion
      const timeoutId = setTimeout(() => {
        saveToFirestore();
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [chatHistory, isClient, user, settings.chatExportEnabled]);

  // Handle pending updates
  useEffect(() => {
    if (pendingUpdateRef.current !== null) {
      const newSettings = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      
      setSettings(prev => ({
        ...prev,
        ...newSettings,
        playlists: newSettings.playlists || prev.playlists || [],
      }));
    }
  }, [settings.pomodoroCount]);

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetAllSettings,
      // Spotify playlists
      spotifyPlaylists,
      currentSpotifyPlaylistUri,
      updateSpotifyPlaylists,
      setCurrentSpotifyPlaylistUri,
      // Chat history
      chatHistory,
      addChatMessage,
      clearChatHistory,
      exportChatHistory,
      isLoadingChat
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}