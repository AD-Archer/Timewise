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
  const { activePresetId, timeLeft, setTimeLeft, isRunning, setIsRunning, currentMode, setCurrentMode, presets } = useTimer();
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
  
  // Add state to track settings updates
  const [settingsUpdated, setSettingsUpdated] = useState<string | null>(null);
  
  // Add state to track initial mount
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
      return;
    }

    // Only run initialization once
    if (!hasInitialized) {
      console.log('Timer component mounted and will persist across tab changes');
      setHasInitialized(true);
      
      // Initial timer setup based on settings
      if (!activePresetId) {
        setTimeLeft(settings.durations[currentMode]);
      }
    }
  }, [isClient, hasInitialized, activePresetId, currentMode, settings.durations, setTimeLeft]);

  // Primary effect to handle settings and preset changes
  useEffect(() => {
    if (!isClient) return;
    
    // Only update timeLeft if timer is not running and settings actually changed
    if (!isRunning) {
      const newTimeLeft = activePresetId 
        ? presets.find(p => p.id === activePresetId)?.durations[currentMode] ?? settings.durations[currentMode]
        : settings.durations[currentMode];
      
      // Only update if the time actually changed
      if (newTimeLeft !== timeLeft) {
        console.log('Settings or preset changed, updating timer');
        setTimeLeft(newTimeLeft);
      }
    }
    
    // Save current mode to localStorage
    localStorage.setItem('currentMode', currentMode);
    
  }, [settings.durations, currentMode, activePresetId, presets, isClient, isRunning, timeLeft, setTimeLeft]);

  // Effect to check for settings updates from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const checkSettingsUpdates = () => {
      const lastUpdated = localStorage.getItem('settingsLastUpdated');
      if (lastUpdated && lastUpdated !== settingsUpdated) {
        console.log('Settings updated from localStorage');
        setSettingsUpdated(lastUpdated);
        
        // Only update if timer is not running and no preset is active
        if (!isRunning && !activePresetId) {
          const newTimeLeft = settings.durations[currentMode];
          if (newTimeLeft !== timeLeft) {
            setTimeLeft(newTimeLeft);
          }
        }
      }
    };
    
    // Check immediately and set up interval with a longer delay
    checkSettingsUpdates();
    const intervalId = setInterval(checkSettingsUpdates, 2000); // Increased from 500ms to 2000ms
    
    return () => clearInterval(intervalId);
  }, [isClient, isRunning, activePresetId, settings.durations, currentMode, settingsUpdated, timeLeft, setTimeLeft]);

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
          // Get the active preset if one is selected
          if (activePresetId) {
            const activePreset = presets.find(p => p.id === activePresetId);
            if (activePreset) {
              setTimeLeft(activePreset.durations.longBreak);
            } else {
              setTimeLeft(settings.durations.longBreak);
            }
          } else {
            setTimeLeft(settings.durations.longBreak);
          }
          setIsRunning(true);
        }
      } else {
        setCurrentMode('shortBreak');
        if (settings.autoStartBreaks) {
          // Get the active preset if one is selected
          if (activePresetId) {
            const activePreset = presets.find(p => p.id === activePresetId);
            if (activePreset) {
              setTimeLeft(activePreset.durations.shortBreak);
            } else {
              setTimeLeft(settings.durations.shortBreak);
            }
          } else {
            setTimeLeft(settings.durations.shortBreak);
          }
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
        // Get the active preset if one is selected
        if (activePresetId) {
          const activePreset = presets.find(p => p.id === activePresetId);
          if (activePreset) {
            setTimeLeft(activePreset.durations.pomodoro);
          } else {
            setTimeLeft(settings.durations.pomodoro);
          }
        } else {
          setTimeLeft(settings.durations.pomodoro);
        }
        setIsRunning(true);
      }
    } else {
      bellSound.play();
      recordBreakComplete();
      setCurrentMode('pomodoro');
      if (settings.autoStartPomodoros) {
        // Get the active preset if one is selected
        if (activePresetId) {
          const activePreset = presets.find(p => p.id === activePresetId);
          if (activePreset) {
            setTimeLeft(activePreset.durations.pomodoro);
          } else {
            setTimeLeft(settings.durations.pomodoro);
          }
        } else {
          setTimeLeft(settings.durations.pomodoro);
        }
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
    setIsRunning,
    activePresetId,
    presets,
    setCurrentMode
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
          // Save timeLeft to localStorage for persistence
          localStorage.setItem('timeLeft', String(prev - 1));
          localStorage.setItem('isRunning', String(true));
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      // Save isRunning state to localStorage
      localStorage.setItem('isRunning', String(false));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerComplete, setTimeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get mode name with proper formatting
  const getModeName = () => {
    switch(currentMode) {
      case 'pomodoro':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return '';
    }
  };

  // Handle reset button click
  const handleReset = () => {
    // Get the active preset if one is selected
    if (activePresetId) {
      const activePreset = presets.find(p => p.id === activePresetId);
      if (activePreset) {
        setTimeLeft(activePreset.durations[currentMode]);
      } else {
        setTimeLeft(settings.durations[currentMode]);
      }
    } else {
      setTimeLeft(settings.durations[currentMode]);
    }
    setIsRunning(false);
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-md mx-auto ${!isVisible ? 'hidden' : ''}`}>
      <div className="w-full backdrop-blur-md bg-white/10 rounded-xl p-6 md:p-8 shadow-2xl mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">{getModeName()}</h2>
          <p className="text-white/70 text-sm">
            {currentMode === 'pomodoro' 
              ? `Pomodoro ${settings.pomodoroCount + 1} of ${settings.targetPomodoros}` 
              : currentMode === 'shortBreak' 
                ? 'Take a short break' 
                : 'Take a long break'}
          </p>
        </div>
        
        <div className="text-center mb-8">
          <div className="font-mono text-7xl md:text-8xl font-bold text-white">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all"
            title="Reset timer"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
