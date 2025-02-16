'use client';

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import Settings from "./components/Settings";
import { useState, useEffect } from "react";

export default function Home() {
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  });

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 400); // Show warning if width is less than 400px
    };

    checkScreenSize(); // Run check on mount
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Small Screen Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center text-white p-6">
          <div className="p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold">
              This site is not usable on smaller screens. Please use a larger device.
            </p>
          </div>
        </div>
      )}

      {/* Timer Centered in the middle */}
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="w-full max-w-lg p-4">
          <Timer durations={durations} />
        </div>
      </div>

      {/* Background Selector below Settings and centered */}
        <BackgroundSelector />

      {/* Settings below the Timer and centered on mobile */}
      <div className="absolute w-full text-center sm:bottom-20">
        <Settings setDurations={setDurations} />
      </div>
    </div>
  );
}
