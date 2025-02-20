'use client';

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import BackgroundImage from "./components/BackgroundImage";
import Settings from "./components/Settings";
import { useState, useEffect } from "react";
import YouTubePlayer from "./components/YoutubePlayer";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function Home() {
  const [showWarning, setShowWarning] = useState(false);

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

            <div className="flex-grow flex items-center justify-center px-4 mb-4">
              <div className="w-full max-w-md">
                <Timer />
              </div>
            </div>

            <div className="relative w-full pb-4">
              <div className="z-20 w-full px-4 pb-16">
                <Settings />
              </div>
            </div>

            {showWarning && (
              <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-black">
                <p className="text-xs text-center text-white">
                  This site works best on larger screens.
                </p>
              </div>
            )}
          </div>
        </main>
      </BackgroundProvider>
    </SettingsProvider>
  );
}
