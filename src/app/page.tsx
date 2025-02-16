'use client'

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import Settings from "./components/Settings";
import { useState } from "react";

export default function Home() {
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  });

  return (
    <div className="relative min-h-screen">
      {/* Timer Centered in the middle */}
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="w-full max-w-lg p-4">
          <Timer durations={durations} />
        </div>
      </div>

      {/* Settings below the Timer and centered on mobile */}
      <div className="absolute w-full text-center sm:bottom-20 sm:w-full sm:text-center">
        <Settings setDurations={setDurations} />
      </div>

      {/* Background Selector below Settings and centered */}
      <div className="absolute w-full text-center sm:bottom-4 sm:-translate--1/2">
        <BackgroundSelector />
      </div>
    </div>
  );
}
