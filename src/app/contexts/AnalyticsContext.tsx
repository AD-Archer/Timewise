'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

interface DailyStats {
  date: string;
  completedPomodoros: number;
  totalFocusTime: number;
  longestStreak: number;
}

interface Analytics {
  totalPomodoros: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  dailyStats: DailyStats[];
}

interface AnalyticsContextType {
  analytics: Analytics;
  recordPomodoroComplete: (focusTime: number) => void;
  recordBreakComplete: () => void;
  resetAnalytics: () => void;
}

const defaultAnalytics: Analytics = {
  totalPomodoros: 0,
  totalFocusTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyStats: [],
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<Analytics>(defaultAnalytics);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedAnalytics = getLocalStorage('analytics', defaultAnalytics);
    setAnalytics(savedAnalytics);
  }, []);

  useEffect(() => {
    if (isClient) {
      setLocalStorage('analytics', analytics);
    }
  }, [analytics, isClient]);

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const updateDailyStats = (focusTime: number) => {
    const today = getTodayKey();
    const updatedDailyStats = [...analytics.dailyStats];
    const todayIndex = updatedDailyStats.findIndex(stat => stat.date === today);

    if (todayIndex >= 0) {
      updatedDailyStats[todayIndex] = {
        ...updatedDailyStats[todayIndex],
        completedPomodoros: updatedDailyStats[todayIndex].completedPomodoros + 1,
        totalFocusTime: updatedDailyStats[todayIndex].totalFocusTime + focusTime,
      };
    } else {
      updatedDailyStats.push({
        date: today,
        completedPomodoros: 1,
        totalFocusTime: focusTime,
        longestStreak: analytics.currentStreak + 1,
      });
    }

    return updatedDailyStats;
  };

  const recordPomodoroComplete = (focusTime: number) => {
    const updatedDailyStats = updateDailyStats(focusTime);
    const newStreak = analytics.currentStreak + 1;

    setAnalytics(prev => ({
      ...prev,
      totalPomodoros: prev.totalPomodoros + 1,
      totalFocusTime: prev.totalFocusTime + focusTime,
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      dailyStats: updatedDailyStats,
    }));
  };

  const recordBreakComplete = () => {
    // You can add break-specific analytics here
  };

  const resetAnalytics = () => {
    setAnalytics(defaultAnalytics);
  };

  return (
    <AnalyticsContext.Provider value={{ 
      analytics, 
      recordPomodoroComplete, 
      recordBreakComplete,
      resetAnalytics 
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
} 