'use client';
import React, { useState, useEffect } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';

interface TimerProps {
  durations: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
}

const Timer: React.FC<TimerProps> = ({ durations }) => {
  const [timeLeft, setTimeLeft] = useState(durations.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  useEffect(() => {
    setTimeLeft(durations[currentMode]);
  }, [durations, currentMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = () => {
    setTimeLeft(durations[currentMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 md:p-8 shadow-2xl">
      {/* Mode Selection */}
      <div className="flex justify-center gap-2 md:gap-3 mb-6 md:mb-8">
        {Object.keys(durations).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode as 'pomodoro' | 'shortBreak' | 'longBreak')}
            className={`px-3 md:px-6 py-2 text-sm md:text-base rounded-full transition-all duration-300 ${
              currentMode === mode 
                ? 'bg-pink-600 text-white shadow-lg scale-105' 
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            {mode.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6 md:mb-8">
        <div className="text-5xl md:text-7xl font-bold text-white tracking-wider">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 md:gap-6">
        <button 
          onClick={toggleTimer} 
          className={`p-3 md:p-4 rounded-full transition-all duration-300 ${
            isRunning 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white shadow-lg hover:scale-110`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={resetTimer} 
          className="p-3 md:p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all duration-300 hover:scale-110"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
};

export default Timer;
