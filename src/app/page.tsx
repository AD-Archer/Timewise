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
    <SettingsProvider>
      <AnalyticsProvider>
        <BackgroundProvider>
          <AchievementsProvider>
            <main className="relative min-h-screen from-gray-900 to-gray-800">
              <BackgroundImage />
              {/* <BackgroundSelector /> */}

              <div className="relative flex flex-col min-h-screen">
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="fixed top-4 right-4 z-40 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                >
                  <SettingsIcon className="w-6 h-6 text-white" />
                </button>

                <div className="flex-grow flex items-center justify-center px-4 mb-4">
                  <div className="w-full max-w-md">
                    <Timer />
                  </div>
                </div>
                
                {/* YouTube Player - Now at the bottom */}
                <div className="sticky bottom-0 z-30 w-full">
                  <YouTubePlayer />
                </div>
                
                {/* Spotify Player */}
                <SpotifyPlayer />
              </div>

              {/* Settings Popup */}
              <SettingsPopup 
                isOpen={showSettings} 
                onClose={handleCloseSettings}
                initialTab={initialSettingsTab}
              />

              {showWarning && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-black">
                  <p className="text-xs text-center text-white">
                    This site works best on larger screens.
                  </p>
                </div>
              )}
            </main>
          </AchievementsProvider>
        </BackgroundProvider>
      </AnalyticsProvider>
    </SettingsProvider>
  );
}
