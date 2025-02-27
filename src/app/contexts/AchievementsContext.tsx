'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const defaultAchievements: Achievement[] = [
  { id: '1', title: 'First Pomodoro', description: 'Complete your first Pomodoro session.', unlocked: false },
  { id: '2', title: 'Streak Starter', description: 'Complete 3 Pomodoro sessions in a row.', unlocked: false },
];

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  useEffect(() => {
    const savedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    if (savedAchievements.length > 0) {
      setAchievements(savedAchievements);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const achievement = prev.find(ach => ach.id === id);
      if (achievement && !achievement.unlocked) {
        toast.success(`Achievement Unlocked: ${achievement.title}`);
        return prev.map(ach => (ach.id === id ? { ...ach, unlocked: true } : ach));
      }
      return prev;
    });
  };

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement }}>
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