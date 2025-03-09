'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { saveUserAnalytics, loadUserData } from '../services/userDataService';

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
  isLoading: boolean;
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
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPomodoros: 0,
    totalFocusTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyStats: []
  });
  const { user } = useAuth();
  const { settings } = useSettings();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load analytics from localStorage or Firestore
  useEffect(() => {
    if (!isClient) return;
    
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // If user is logged in and we're not storing data locally, try to load from Firestore
        if (user && settings && settings.storeMoodDataLocally === false) {
          console.log('Loading analytics data from Firestore...');
          const userData = await loadUserData(user.uid);
          
          if (userData && userData.analytics) {
            console.log('Found analytics data in Firestore');
            setAnalytics(userData.analytics);
            setIsLoading(false);
            return;
          } else {
            console.log('No analytics data found in Firestore');
          }
        }
        
        // Fall back to localStorage
        const savedAnalytics = getLocalStorage('analytics', defaultAnalytics);
        setAnalytics(savedAnalytics);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Fall back to localStorage on error
        const savedAnalytics = getLocalStorage('analytics', defaultAnalytics);
        setAnalytics(savedAnalytics);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalytics();
  }, [isClient, user, settings]);

  // Save analytics to localStorage and Firestore when they change
  useEffect(() => {
    if (!isClient) return;
    
    // Always save to localStorage
    setLocalStorage('analytics', analytics);
    
    // If user is logged in and we're not storing data locally, also save to Firestore
    if (user && settings && settings.storeMoodDataLocally === false) {
      const saveToFirestore = async () => {
        try {
          console.log('Saving analytics data to Firestore...');
          await saveUserAnalytics(user.uid, analytics);
          console.log('Analytics data saved to Firestore');
        } catch (error) {
          console.error('Error saving analytics to Firestore:', error);
        }
      };
      
      // Debounce the save to avoid too many Firestore writes
      const timeoutId = setTimeout(() => {
        saveToFirestore();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [analytics, isClient, user, settings]);

  const getTodayKey = () => {
    if (!isClient) return ''; // Return empty string on server-side
    return new Date().toISOString().split('T')[0];
  };

  const updateDailyStats = (focusTime: number) => {
    if (!isClient) return [...analytics.dailyStats]; // Return current stats on server-side
    
    const today = getTodayKey();
    if (!today) return [...analytics.dailyStats]; // Return current stats if not on client-side
    
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
    // Always get an array of daily stats
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
      isLoading,
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