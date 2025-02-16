'use client'
import React, { useState, useEffect } from 'react';
import { Pause, Play, RefreshCw, Clock } from 'lucide-react';

const TIMER_PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 10 * 60,
};

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    setTimeLeft(TIMER_PRESETS[currentMode]);
  }, [currentMode]);

  const resetTimer = () => {
    setTimeLeft(TIMER_PRESETS[currentMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-transparent text-blue-100 shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <div className="flex justify-center space-x-2 mb-4">
        {Object.keys(TIMER_PRESETS).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode as 'pomodoro' | 'shortBreak' | 'longBreak')}
            className={`px-4 py-2 rounded ${currentMode === mode ? 'bg-blue-700' : 'bg-blue-500'} hover:opacity-80`}
          >
            {mode.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col items-center mb-6">
        <Clock className="w-12 h-12 text-blue-300 mb-2" />
        <h2 className="text-xl font-semibold text-blue-200">Pomodoro Timer</h2>
      </div>
      
      <div className="mt-4 text-center text-4xl font-bold text-blue-200 bg-transparent py-3 rounded">
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

export default PomodoroTimer;
