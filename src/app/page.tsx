'use client';

import { useState, useEffect, useCallback } from "react";
import Timer from "./components/Timer/Timer";
import MoodTracker from "./components/MoodTracker/MoodTracker";
import TabNavigation from "./components/TabNavigation";
import BackgroundImage from "./components/Background/BackgroundImage";
import SettingsPopup from "./components/Settings/SettingsPopup";
import { Settings as SettingsIcon } from 'lucide-react';
import YouTubePlayer from "./components/Music/YoutubePlayer";
import SpotifyPlayer from "./components/Music/SpotifyPlayer";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { MusicProvider } from './contexts/MusicContext';
import TimeDisplay from "./components/Clock";
import IntroAnimation from "./components/IntroAnimation";
import TimerPresets from "./components/Timer/TimerPresets";
import ChatBot from "./components/ChatBot/ChatBot";
import AuthButton from "./components/Auth/AuthButton";
import { useAuth } from "./contexts/AuthContext";
import { useSettings, PlaylistInfo, Settings } from "./contexts/SettingsContext";
import { saveUserSettings, loadUserData } from "./services/userDataService";
import type { UserSettings } from "./services/userDataService";
import { useMood } from "./contexts/MoodContext";

// Define the Playlist type to match userDataService
interface Playlist {
  id: string;
  name: string;
  videos: string[];
}

export default function Home() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { entries, addEntry } = useMood();
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'timer' | 'background' | 'music' | 'analytics' | 'achievements'>('timer');
  const [activeTab, setActiveTab] = useState<'mood' | 'timer' | 'chat'>('mood');
  const [showIntro, setShowIntro] = useState(true);
  const [introReady, setIntroReady] = useState(false);

  // Load user data from Firestore when user logs in
  useEffect(() => {
    const loadUserDataFromFirestore = async () => {
      if (user) {
        try {
          const userData = await loadUserData(user.uid);
          
          if (userData && userData.settings) {
            // Type cast to ensure compatibility
            const compatibleSettings = {
              ...userData.settings,
              moodTrackingFrequency: userData.settings.moodTrackingFrequency as "endOfSession" | "endOfPomodoro" | "daily" | "manual" | undefined,
              chatbotPersonality: userData.settings.chatbotPersonality as "supportive" | "direct" | "humorous" | "analytical" | undefined,
              chatbotModel: userData.settings.chatbotModel as "gpt-3.5-turbo" | "gpt-4" | undefined,
            };
            
            // Convert playlist format if needed
            if (compatibleSettings.playlists) {
              const convertedPlaylists = compatibleSettings.playlists.map((playlist: {id: string, name: string, videos?: string[]}) => ({
                id: playlist.id,
                name: playlist.name,
                url: `https://youtube.com/playlist?list=${playlist.id}`,
                videos: playlist.videos || []
              }));
              
              compatibleSettings.playlists = convertedPlaylists as PlaylistInfo[];
            }
            
            updateSettings(compatibleSettings as Partial<Settings>);
          }
          
          // Load mood data if it exists and storeMoodDataLocally is false
          if (userData && userData.moodData && userData.settings && userData.settings.storeMoodDataLocally === false) {
            console.log('Found mood data in Firestore, attempting to load:', userData.moodData);
            // Convert Firestore mood data format to MoodContext format
            if (userData.moodData.entries && Array.isArray(userData.moodData.entries)) {
              console.log(`Processing ${userData.moodData.entries.length} mood entries from Firestore`);
              
              // Create a map of existing entries by timestamp for faster lookup
              const existingEntriesMap = new Map();
              entries.forEach(entry => {
                existingEntriesMap.set(new Date(entry.date).getTime(), true);
              });
              
              let addedCount = 0;
              let skippedCount = 0;
              
              userData.moodData.entries.forEach(entry => {
                try {
                  if (!entry || typeof entry !== 'object') {
                    console.warn('Invalid entry format:', entry);
                    return;
                  }
                  
                  // Check if this entry already exists in local storage to avoid duplicates
                  const timestamp = entry.timestamp;
                  if (!timestamp) {
                    console.warn('Entry missing timestamp:', entry);
                    return;
                  }
                  
                  // Use the map for faster lookup
                  if (!existingEntriesMap.has(timestamp)) {
                    addEntry(
                      entry.mood || 3, // Default to neutral mood if missing
                      entry.notes || '',
                      entry.tags || [] // Use tags from Firestore if available
                    );
                    addedCount++;
                  } else {
                    skippedCount++;
                  }
                } catch (entryError) {
                  console.error('Error processing mood entry:', entryError, entry);
                }
              });
              
              console.log(`Mood data loading complete. Added ${addedCount} new entries, skipped ${skippedCount} existing entries.`);
            } else {
              console.log('No mood entries found or entries is not an array:', userData.moodData);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserDataFromFirestore();
  }, [user, updateSettings, entries, addEntry]);

  // Save user data to Firestore when settings change
  useEffect(() => {
    const saveUserDataToFirestore = async () => {
      if (user) {
        try {
          // Convert PlaylistInfo to Playlist format for storage
          const convertedSettings = {
            ...settings,
            playlists: settings.playlists.map(playlist => ({
              id: playlist.id,
              name: playlist.name,
              videos: []
            })) as unknown as Playlist[]
          };
          
          // Only save the settings object to Firestore (not Spotify playlists or chat history)
          await saveUserSettings(user.uid, convertedSettings as UserSettings);
        } catch (error) {
          console.error('Error saving user settings:', error);
        }
      }
    };

    // Only save if user is logged in and settings have been loaded
    if (user && settings) {
      saveUserDataToFirestore();
    }
  }, [user, settings]);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300);
    };

    // Check if intro has been shown in this session
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    } else {
      // Set intro as ready after a small delay to ensure smooth loading
      setTimeout(() => {
        setIntroReady(true);
      }, 100);
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    // Listen for custom event to open settings to a specific tab
    const handleOpenSettingsTab = (event: CustomEvent) => {
      setShowSettings(true);
      if (event.detail && event.detail.tab) {
        setInitialSettingsTab(event.detail.tab);
      }
    };

    // Listen for custom event to open auth modal
    const handleOpenAuthModal = () => {
      // This will be handled by the AuthButton component
      window.dispatchEvent(new CustomEvent('openAuthModal'));
    };

    window.addEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    window.addEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
      window.removeEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    };
  }, []);

  // Notify when settings popup is closed
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    window.dispatchEvent(new Event('settingsPopupClosed'));
  }, []);

  // Handle intro animation completion
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  }, []);

  return (
    <BackgroundProvider>
      <AnalyticsProvider>
        <MusicProvider>
          <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
            {/* Background */}
            <BackgroundImage />
            
            {/* Intro Animation */}
            {showIntro && introReady && (
              <IntroAnimation onComplete={handleIntroComplete} />
            )}
            
            {/* Warning for small screens */}
            {showWarning && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-gray-900 p-6 rounded-lg max-w-sm text-center">
                  <h2 className="text-xl font-bold text-white mb-2">Screen Too Small</h2>
                  <p className="text-gray-300 mb-4">
                    Your screen is too small to display this app properly. Please use a device with a larger screen.
                  </p>
                </div>
              </div>
            )}
            
            {/* Settings Button */}
            <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
              <AuthButton onOpenSettings={() => setShowSettings(true)} />
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Settings Popup */}
            {showSettings && (
              <SettingsPopup isOpen={showSettings} onClose={handleCloseSettings} initialTab={initialSettingsTab} />
            )}
            
            {/* Desktop Clock (visible on medium and larger screens) */}
            <div className="fixed top-4 left-4 z-40 hidden md:block">
              <TimeDisplay size="medium" showSeconds={true} />
            </div>
            
            {/* Mobile Clock (visible on small screens) */}
            <div className="fixed top-4 left-4 z-40 md:hidden">
              <TimeDisplay size="small" showSeconds={false} />
            </div>
            
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
              {/* Tab Navigation */}
              <div className="w-full max-w-4xl mb-6">
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
              
              {/* Tab Content */}
              <div className="w-full max-w-4xl">
                {activeTab === 'timer' && (
                  <div className="space-y-6">
                    <Timer />
                    <TimerPresets />
                  </div>
                )}
                
                {activeTab === 'mood' && <MoodTracker />}
                
                {activeTab === 'chat' && <ChatBot />}
              </div>
            </div>
            
            {/* Music Players */}
            <div className="fixed bottom-4 left-4 z-40">
              <SpotifyPlayer />
              <YouTubePlayer />
            </div>
          </main>
        </MusicProvider>
      </AnalyticsProvider>
    </BackgroundProvider>
  );
}
