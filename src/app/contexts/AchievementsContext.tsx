'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  resetAchievements: () => void;
}
// these are the default achievements that will be used by acheivements.tsx
// when I add a database I'm debating on wherter or now I should stop users from being able to edit the achievements by storing this. But I don't think I'll get away with that
const defaultAchievements: Achievement[] = [
  { id: '1', title: 'First Pomodoro', description: 'Complete your first Pomodoro session.', unlocked: false },
  { id: '2', title: 'Streak Starter', description: 'Complete 3 Pomodoro sessions in a row.', unlocked: false },
  { id: '3', title: 'Focus Master', description: 'Complete 10 Pomodoro sessions in total.', unlocked: false },
  { id: '4', title: 'Productivity Pro', description: 'Complete 25 Pomodoro sessions in total.', unlocked: false },
  { id: '5', title: 'Time Wizard', description: 'Accumulate 5 hours of focus time.', unlocked: false },
  { id: '6', title: 'Consistency King', description: 'Achieve a streak of 5 Pomodoro sessions.', unlocked: false },
  { id: '7', title: 'Daily Dedication', description: 'Complete at least 4 Pomodoro sessions in a single day.', unlocked: false },
  { id: '8', title: 'Weekend Warrior', description: 'Complete a Pomodoro session on a weekend.', unlocked: false },
  { id: '9', title: 'Early Bird', description: 'Complete a Pomodoro session before 9 AM.', unlocked: false },
  { id: '10', title: 'Night Owl', description: 'Complete a Pomodoro session after 10 PM.', unlocked: false },
];

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [isClient, setIsClient] = useState(false);
  const unlockedAchievementRef = useRef<string | null>(null);

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load achievements from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedAchievements = localStorage.getItem('achievements');
      if (savedAchievements) {
        const parsedAchievements = JSON.parse(savedAchievements);
        
        // Ensure all default achievements exist (in case new ones were added)
        const mergedAchievements = defaultAchievements.map(defaultAch => {
          const savedAch = parsedAchievements.find((a: Achievement) => a.id === defaultAch.id);
          return savedAch || defaultAch;
        });
        
        setAchievements(mergedAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Fallback to default achievements if there's an error
      setAchievements(defaultAchievements);
    }
  }, [isClient]);

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;
    
    try {
      localStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, [achievements, isClient]);

  // Handle toast notifications for unlocked achievements
  useEffect(() => {
    if (unlockedAchievementRef.current) {
      const achievement = achievements.find(ach => ach.id === unlockedAchievementRef.current);
      if (achievement && achievement.unlocked) {
        toast.success(`Achievement Unlocked: ${achievement.title}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      unlockedAchievementRef.current = null;
    }
  }, [achievements]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(ach => ach.id === id);
      if (achievement && !achievement.unlocked) {
        unlockedAchievementRef.current = id;
        return prev.map(ach => (ach.id === id ? { ...ach, unlocked: true } : ach));
      }
      return prev;
    });
  };
  
  const resetAchievements = () => {
    if (confirm('Are you sure you want to reset all achievements? This cannot be undone.')) {
      setAchievements(defaultAchievements);
      toast.info('All achievements have been reset', {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement, resetAchievements }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}