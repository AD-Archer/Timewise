'use client';

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import Settings from "./components/Settings";
import { useState, useEffect } from "react";
import YouTubePlayer from "./components/YoutubePlayer";

export default function Home() {
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  });

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300); // Only show warning for very small screens
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* YouTube Player - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <YouTubePlayer />
      </div>

      {/* Small Screen Warning */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="p-4 rounded-lg shadow-lg text-center">
            <p className="text-sm md:text-lg font-semibold text-white">
              This site works best on larger screens.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-2 md:px-4 pt-24 md:pt-32 pb-24">
        {/* Timer */}
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-full max-w-xl">
            <Timer durations={durations} />
          </div>
        </div>

        {/* Background Selector and Settings are positioned fixed */}
        <BackgroundSelector />
        <Settings setDurations={setDurations} />
      </div>
    </main>
  );
}
