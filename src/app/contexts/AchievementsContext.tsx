'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { getUserAchievements, saveUserAchievements } from '../firebase/firestore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsContextType {
  achievements: Achievement[];
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const unlockedAchievementRef = useRef<string | null>(null);
  const { user } = useAuth();

  // Set isClient to true after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load achievements from Firestore if user is logged in, otherwise from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        console.log('Loading achievements data...');
        
        if (user) {
          // Try to load from Firestore first
          const firestoreAchievements = await getUserAchievements(user.uid);
          
          if (firestoreAchievements) {
            console.log('Found achievements in Firestore');
            // Ensure all default achievements exist (in case new ones were added)
            const mergedAchievements = defaultAchievements.map(defaultAch => {
              const savedAch = firestoreAchievements.find(a => a.id === defaultAch.id);
              return savedAch || defaultAch;
            });
            
            setAchievements(mergedAchievements);
            setIsLoading(false);
            return;
          } else {
            console.log('No achievements found in Firestore');
          }
        }
        
        // Fall back to localStorage if not logged in or no Firestore data
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
          console.log('Loading achievements from localStorage');
          const parsedAchievements = JSON.parse(savedAchievements);
          
          // Ensure all default achievements exist (in case new ones were added)
          const mergedAchievements = defaultAchievements.map(defaultAch => {
            const savedAch = parsedAchievements.find((a: Achievement) => a.id === defaultAch.id);
            return savedAch || defaultAch;
          });
          
          setAchievements(mergedAchievements);
        } else {
          console.log('No achievements found in localStorage, using defaults');
          setAchievements(defaultAchievements);
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
        // Fallback to default achievements if there's an error
        setAchievements(defaultAchievements);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAchievements();
  }, [isClient, user]);

  // Save achievements to Firestore if user is logged in, otherwise to localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const saveAchievements = async () => {
      try {
        if (user) {
          // Save to Firestore if user is logged in
          await saveUserAchievements(user.uid, achievements);
        } else {
          // Save to localStorage if not logged in
          localStorage.setItem('achievements', JSON.stringify(achievements));
        }
      } catch (error) {
        console.error('Error saving achievements:', error);
      }
    };
    
    saveAchievements();
  }, [achievements, isClient, user]);

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
    <AchievementsContext.Provider value={{ 
      achievements,
      isLoading, 
      unlockAchievement, 
      resetAchievements 
    }}>
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