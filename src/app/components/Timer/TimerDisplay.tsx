'use client';

import React, { useState, useEffect } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { Pause, Play } from 'lucide-react';
import { usePage } from '../../contexts/PageContext';

/**
 * Persistent timer display
 * Shows the current timer regardless of active tab
 * Only visible on medium and larger screens (768px+)
 * Allows toggling timer state by clicking
 * Click with Alt/Option to switch to Timer tab
 */
const TimerDisplay = () => {
  const { timeLeft, isRunning, setIsRunning, currentMode } = useTimer();
  const { setActiveTab, activeTab } = usePage();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind is 768px
    };
    
    // Set initial value
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render component at all on mobile
  if (isMobile) return null;

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

  // Get mode color
  const getModeColor = () => {
    switch(currentMode) {
      case 'pomodoro':
        return 'text-pink-400';
      case 'shortBreak':
        return 'text-blue-400';
      case 'longBreak':
        return 'text-purple-400';
      default:
        return 'text-white/70';
    }
  };

  // Handle click with different behaviors based on modifier keys
  const handleClick = (e: React.MouseEvent) => {
    // If Alt/Option key is pressed, navigate to Timer tab
    if (e.altKey) {
      setActiveTab('timer');
    } else {
      // Regular click toggles timer
      setIsRunning(!isRunning);
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-30 backdrop-blur-md bg-black/30 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer hover:bg-black/40 transition-colors"
      onClick={handleClick}
      title="Click to toggle timer | Alt+Click to go to Timer tab"
    >
      <div className="flex flex-col items-end">
        <div className={`font-mono text-xl ${isRunning ? 'text-green-400' : 'text-white/80'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className={`text-xs ${getModeColor()}`}>
          {getModeName()} {activeTab !== 'timer' && <span className="text-white/50 text-[10px]">(Alt+Click for Timer tab)</span>}
        </div>
      </div>
      <div className="text-xs opacity-60">
        {isRunning ? <Pause size={14} /> : <Play size={14} />}
      </div>
    </div>
  );
};

export default TimerDisplay; 