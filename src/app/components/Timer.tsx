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
    <div className=" text-blue-100 shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <div className="flex justify-center space-x-2 mb-4">
        {Object.keys(durations).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode as 'pomodoro' | 'shortBreak' | 'longBreak')}
            className={`px-4 py-2 rounded ${currentMode === mode ? 'bg-pink-700' : 'bg-pink-500'} hover:opacity-80`}
          >
            {mode.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center text-4xl font-bold text-blue-200 bg-pink-400 py-3 rounded">
        {formatTime(timeLeft)}
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <button 
          onClick={toggleTimer} 
          className={`p-3 rounded-full ${isRunning ? 'bg-yellow-600' : 'bg-green-600'} text-white hover:opacity-80 transition-opacity`}
        >
          {isRunning ? <Pause /> : <Play />}
        </button>
        <button 
          onClick={resetTimer} 
          className="p-3 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
        >
          <RefreshCw />
        </button>
      </div>
    </div>
  );
};

export default Timer;
