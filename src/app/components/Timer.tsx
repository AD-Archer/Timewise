'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Timer = () => {
  const { settings, updateSettings } = useSettings();
  const [timeLeft, setTimeLeft] = useState(settings.durations.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');

  useEffect(() => {
    setTimeLeft(settings.durations[currentMode]);
  }, [settings.durations, currentMode]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    if (currentMode === 'pomodoro') {
      const newCount = settings.pomodoroCount + 1;
      updateSettings({ pomodoroCount: newCount });

      if (newCount >= settings.targetPomodoros) {
        setCurrentMode('longBreak');
        if (settings.autoStartBreaks) {
          setTimeLeft(settings.durations.longBreak);
          setIsRunning(true);
        }
      } else {
        setCurrentMode('shortBreak');
        if (settings.autoStartBreaks) {
          setTimeLeft(settings.durations.shortBreak);
          setIsRunning(true);
        }
      }
    } else {
      setCurrentMode('pomodoro');
      if (settings.autoStartPomodoros) {
        setTimeLeft(settings.durations.pomodoro);
        setIsRunning(true);
      }
    }
  }, [settings, currentMode, updateSettings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  useEffect(() => {
    if (settings.pomodoroCount >= settings.targetPomodoros) {
      updateSettings({ pomodoroCount: 0 });
    }
  }, [settings.pomodoroCount, settings.targetPomodoros, updateSettings]);

  const resetTimer = () => {
    setTimeLeft(settings.durations[currentMode]);
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
        {Object.keys(settings.durations).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setCurrentMode(mode as 'pomodoro' | 'shortBreak' | 'longBreak');
              setTimeLeft(settings.durations[mode as keyof typeof settings.durations]);
              setIsRunning(false);
            }}
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
        <div className="text-sm text-white/60 mt-2">
          Pomodoro #{settings.pomodoroCount + 1} of {settings.targetPomodoros}
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
