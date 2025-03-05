'use client';

import Timer from "./components/Timer";
// import BackgroundSelector from "./components/Background";
import BackgroundImage from "./components/Background/BackgroundImage";
import SettingsPopup from "./components/Settings/SettingsPopup";
import { Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import YouTubePlayer from "./components/Music/YoutubePlayer";
import SpotifyPlayer from "./components/Music/SpotfiyPlayer";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AchievementsProvider } from './contexts/AchievementsContext';
import { MusicProvider } from './contexts/MusicContext';

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'timer' | 'background' | 'music' | 'analytics' | 'achievements'>('timer');

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    // Listen for custom event to open settings to a specific tab
    const handleOpenSettingsTab = (event: CustomEvent) => {
      setShowSettings(true);
      if (event.detail && event.detail.tab) {
        setInitialSettingsTab(event.detail.tab);
      }
    };

    window.addEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    };
  }, []);

  // Notify when settings popup is closed
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    window.dispatchEvent(new Event('settingsPopupClosed'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Screen Too Small</h2>
            <p>Your screen is too small to display this application properly. Please use a device with a larger screen.</p>
          </div>
        </div>
      )}

      <SettingsProvider>
        <AnalyticsProvider>
          <AchievementsProvider>
            <BackgroundProvider>
              <MusicProvider>
                <BackgroundImage />
                
                <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center px-4">
                  <Timer />
                  
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="fixed top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                    aria-label="Settings"
                  >
                    <SettingsIcon size={24} />
                  </button>
                  
                  {showSettings && (
                    <SettingsPopup 
                      isOpen={showSettings}
                      onClose={handleCloseSettings} 
                      initialTab={initialSettingsTab}
                    />
                  )}
                </div>
                
                <YouTubePlayer />
                <SpotifyPlayer />
              </MusicProvider>
            </BackgroundProvider>
          </AchievementsProvider>
        </AnalyticsProvider>
      </SettingsProvider>
    </main>
  );
}
