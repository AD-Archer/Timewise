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
      {/* Background Image - Always at the back */}
      <BackgroundSelector />

      {/* Main Content Container */}
      <div className="relative flex flex-col min-h-screen">
        {/* YouTube Player - Fixed at top */}
        <div className="sticky top-0 z-30 w-full">
          <YouTubePlayer />
        </div>

        {/* Timer Section */}
        <div className="flex-grow flex items-center justify-center px-4 mb-4">
          <div className="w-full max-w-md">
            <Timer durations={durations} />
          </div>
        </div>

        {/* Bottom Controls Container */}
        <div className="relative w-full pb-4">
          {/* Settings Panel */}
          <div className="z-20 w-full px-4 pb-16">
            <Settings setDurations={setDurations} />
          </div>
        </div>

        {/* Small Screen Warning - At the very bottom */}
        {showWarning && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-black">
            <p className="text-xs text-center text-white">
              This site works best on larger screens.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
