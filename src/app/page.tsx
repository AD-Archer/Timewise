'use client';

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import BackgroundImage from "./components/BackgroundImage";
import SettingsPopup from "./components/SettingsPopup";
import { Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect } from "react";
import YouTubePlayer from "./components/YoutubePlayer";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <SettingsProvider>
      <BackgroundProvider>
        <main className="relative min-h-screen from-gray-900 to-gray-800">
          <BackgroundImage />
          <BackgroundSelector />

          <div className="relative flex flex-col min-h-screen">
            <div className="sticky top-0 z-30 w-full">
              <YouTubePlayer />
            </div>

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
          </div>

          {/* Settings Popup */}
          <SettingsPopup 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />

          {showWarning && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-black">
              <p className="text-xs text-center text-white">
                This site works best on larger screens.
              </p>
            </div>
          )}
        </main>
      </BackgroundProvider>
    </SettingsProvider>
  );
}
