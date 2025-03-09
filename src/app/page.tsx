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
import Clock from "./components/Clock";
import IntroAnimation from "./components/IntroAnimation";

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'timer' | 'background' | 'music' | 'analytics' | 'achievements'>('timer');
  const [activeTab, setActiveTab] = useState<'mood' | 'timer'>('mood');
  const [showIntro, setShowIntro] = useState(true);
  const [introReady, setIntroReady] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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

    window.addEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    
    // Update time every second for the mobile clock
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
      clearInterval(timeInterval);
    };
  }, []);

  // Notify when settings popup is closed
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    window.dispatchEvent(new Event('settingsPopupClosed'));
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  }, []);

  const handleTabChange = useCallback((tab: 'mood' | 'timer') => {
    setActiveTab(tab);
  }, []);

  return (
    <BackgroundProvider>
      <AnalyticsProvider>
        <MusicProvider>
          <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
            {showIntro && introReady && <IntroAnimation onComplete={handleIntroComplete} />}
            
            <BackgroundImage />
            
            {showWarning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
                <div className="bg-zinc-900 p-6 rounded-lg max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4">Screen Too Small</h2>
                  <p>Your screen is too small to use this application properly. Please use a device with a larger screen.</p>
                </div>
              </div>
            )}
            
            {showSettings && (
              <SettingsPopup isOpen={showSettings} onClose={handleCloseSettings} initialTab={initialSettingsTab} />
            )}
            
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Hide clock on mobile screens, show only on desktop */}
            <div className="absolute top-4 left-4 z-30 hidden md:block">
              <Clock />
            </div>
            
            {/* Mobile-friendly clock that appears at the top center with smaller size */}
            <div className="absolute top-0 left-0 right-0 flex justify-center z-30 md:hidden">
              <div className="scale-75 transform-origin-top mt-1">
                <div className="bg-black/40 backdrop-blur-sm rounded-b-lg px-3 py-1 shadow-lg">
                  <div className="text-xl font-medium text-white">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true})}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center flex-grow px-4 pt-12 md:pt-8 pb-8 relative z-10">
              <div className={`w-full max-w-2xl transition-all duration-300 ${activeTab === 'mood' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute pointer-events-none'}`}>
                <MoodTracker />
              </div>
              
              <div className={`w-full max-w-2xl transition-all duration-300 ${activeTab === 'timer' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute pointer-events-none'}`}>
                <Timer />
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 z-30">
              <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            
            <div className="fixed bottom-20 right-4 z-30">
              <YouTubePlayer />
              <SpotifyPlayer />
            </div>
          </main>
        </MusicProvider>
      </AnalyticsProvider>
    </BackgroundProvider>
  );
}
