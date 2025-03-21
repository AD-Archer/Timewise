'use client';
/**
 * Timer Component
 * 
 * Persists across tab changes to maintain timer state
 * Uses CSS to control visibility based on active tab
 * 
 * Note
 * It connects with the SpotifyPlayer component through the MusicContext to pause music on timer end I think I could use this to stop youtube but I am unsure how to do it consistently,
 * 
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useSound } from '../../hooks/useSound';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useAchievements } from '../../contexts/AchievementsContext';
import { useMusic } from '../../contexts/MusicContext';
import { useTimer } from '../../contexts/TimerContext';
import useTabVisibility from '../../hooks/useTabVisibility';

const Timer = () => {
  const { settings, updateSettings } = useSettings();
  const { activePresetId, timeLeft, setTimeLeft, isRunning, setIsRunning, currentMode, setCurrentMode } = useTimer();
  const pomodoroCompletedRef = useRef(false);
  const newPomodoroCountRef = useRef(0);
  const { pauseMusic } = useMusic();
  const { isVisible } = useTabVisibility('timer');

  // Sound effects
  const bellSound = useSound('/sounds/meditation-bell.mp3');

  const { recordPomodoroComplete, recordBreakComplete, analytics } = useAnalytics();
  const { unlockAchievement } = useAchievements();
  
  // State for client-side only date values
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
    console.log('Timer component mounted and will persist across tab changes');
  }, []);

  useEffect(() => {
    // Only set timeLeft on initial load or when mode changes
    if (!isClient) return;
    const savedTimeLeft = localStorage.getItem('timeLeft');
    const savedIsRunning = localStorage.getItem('isRunning');
    if (savedTimeLeft && savedIsRunning) {
      setTimeLeft(parseInt(savedTimeLeft, 10));
      setIsRunning(savedIsRunning === 'true');
    } else {
      setTimeLeft(settings.durations[currentMode]);
    }
  }, [settings.durations, currentMode, setTimeLeft, isClient]);

  // Check for achievements when a pomodoro is completed
  const checkAchievements = useCallback(() => {
    if (!isClient) return; // Skip on server-side
    
    // Check for streak achievements
    const { currentStreak } = analytics;
    if (currentStreak === 5) {
      unlockAchievement('6'); // Consistency King
    }
    
    // Check for daily dedication
    const today = new Date().toISOString().split('T')[0];
    const todayStats = analytics.dailyStats.find(stat => stat.date === today);
    if (todayStats && todayStats.completedPomodoros >= 4) {
      unlockAchievement('7'); // Daily Dedication
    }
    
    // Check for time-based achievements
    const currentHour = new Date().getHours();
    if (currentHour < 9) {
      unlockAchievement('9'); // Early Bird
    }
    if (currentHour >= 22) {
      unlockAchievement('10'); // Night Owl
    }
    
    // Check for weekend warrior
    const currentDay = new Date().getDay();
    if (currentDay === 0 || currentDay === 6) { // 0 is Sunday, 6 is Saturday
      unlockAchievement('8'); // Weekend Warrior
    }
    
    // Check for total focus time
    if (analytics.totalFocusTime >= 300) { // 5 hours = 300 minutes
      unlockAchievement('5'); // Time Wizard
    }
  }, [analytics, unlockAchievement, isClient]);

  // Handle achievement unlocking separately from timer completion
  useEffect(() => {
    if (!isClient) return; // Skip on server-side
    
    if (pomodoroCompletedRef.current) {
      const newCount = newPomodoroCountRef.current;
      
      // Unlock achievements
      if (newCount === 1) {
        unlockAchievement('1'); // First Pomodoro
      }
      if (newCount === 3) {
        unlockAchievement('2'); // Streak Starter
      }
      
      // New achievements
      if (newCount === 10) {
        unlockAchievement('3'); // Focus Master
      }
      if (newCount === 25) {
        unlockAchievement('4'); // Productivity Pro
      }
      
      // Check for other achievements
      checkAchievements();
      
      pomodoroCompletedRef.current = false;
    }
  }, [analytics, unlockAchievement, settings.pomodoroCount, isClient, checkAchievements]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Pause Spotify music when timer ends via MusicContext
    pauseMusic();
    
    if (currentMode === 'pomodoro') {
      bellSound.play();
      const newCount = settings.pomodoroCount + 1;
      newPomodoroCountRef.current = newCount;
      pomodoroCompletedRef.current = true;
      
      updateSettings({ pomodoroCount: newCount });
      
      // Ensure recordPomodoroComplete is called in a callback
      setTimeout(() => {
        recordPomodoroComplete(settings.durations.pomodoro / 60);
      }, 0);

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
    } else if (currentMode === 'longBreak') {
      bellSound.play();
      recordBreakComplete();
      // Reset pomodoro count after completing the long break
      updateSettings({ pomodoroCount: 0 });
      setCurrentMode('pomodoro');
      if (settings.autoStartPomodoros) {
        setTimeLeft(settings.durations.pomodoro);
        setIsRunning(true);
      }
    } else {
      bellSound.play();
      recordBreakComplete();
      setCurrentMode('pomodoro');
      if (settings.autoStartPomodoros) {
        setTimeLeft(settings.durations.pomodoro);
        setIsRunning(true);
      }
    }
  }, [
    currentMode, 
    settings.pomodoroCount, 
    settings.targetPomodoros, 
    settings.autoStartBreaks, 
    settings.autoStartPomodoros, 
    settings.durations.pomodoro, 
    settings.durations.shortBreak,
    settings.durations.longBreak,
    updateSettings, 
    recordPomodoroComplete, 
    recordBreakComplete, 
    bellSound,
    pauseMusic,
    setTimeLeft,
    setIsRunning
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => {
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
  }, [isRunning, timeLeft, handleTimerComplete, setTimeLeft]);

  const resetTimer = () => {
    setTimeLeft(settings.durations[currentMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning((prev: boolean) => !prev);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save the current time left and running state
        localStorage.setItem('timeLeft', timeLeft.toString());
        localStorage.setItem('isRunning', isRunning.toString());
      } else if (document.visibilityState === 'visible') {
        // Restore the time left and running state
        const savedTimeLeft = localStorage.getItem('timeLeft');
        const savedIsRunning = localStorage.getItem('isRunning');
        if (savedTimeLeft) {
          setTimeLeft(parseInt(savedTimeLeft, 10));
        }
        if (savedIsRunning === 'true') {
          setIsRunning(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeLeft, isRunning, setTimeLeft, setIsRunning]);

  return (
    <div className={`backdrop-blur-sm bg-white/10 rounded-xl p-4 md:p-8 shadow-2xl ${!isVisible ? 'hidden' : ''}`}>
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
          {activePresetId && (
            <span className="ml-2 text-xs bg-pink-600/40 px-2 py-0.5 rounded-full">
              Using preset
            </span>
          )}
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
