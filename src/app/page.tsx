'use client';

import Timer from "./components/Timer/Timer";
// import BackgroundSelector from "./components/Background";
import BackgroundImage from "./components/Background/BackgroundImage";
import SettingsPopup from "./components/Settings/SettingsPopup";
import { Settings as SettingsIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import YouTubePlayer from "./components/Music/YoutubePlayer";
import SpotifyPlayer from "./components/Music/SpotifyPlayer";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { MusicProvider } from './contexts/MusicContext';
import Clock from "./components/Clock";
import TimerPresets from "./components/Timer/TimerPresets";

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'timer' | 'background' | 'music' | 'analytics' | 'achievements'>('timer');
  const [showPresets, setShowPresets] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300);
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
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

  // Toggle presets visibility
  const togglePresets = useCallback(() => {
    setShowPresets(prev => !prev);
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

      <AnalyticsProvider>
        <BackgroundProvider>
          <MusicProvider>
            <BackgroundImage />
            
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center px-4 py-8">
              <div className="fixed top-4 left-4">
                <Clock />
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full">
                <div className="w-full md:w-auto">
                  <Timer />
                </div>
                
                {/* Presets section - always visible on desktop, conditionally visible on mobile */}
                {(!isMobile || showPresets) && (
                  <div className="w-full md:w-auto transition-all duration-300 animate-fade-in">
                    <TimerPresets />
                  </div>
                )}
              </div>
              
              {/* Toggle presets button - visible only on mobile */}
              {isMobile && (
                <button
                  onClick={togglePresets}
                  className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-full flex items-center gap-1"
                >
                  {showPresets ? (
                    <>
                      <ChevronUp size={16} />
                      <span>Hide Presets</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Show Presets</span>
                    </>
                  )}
                </button>
              )}
              
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
      </AnalyticsProvider>
    </main>
  );
}
