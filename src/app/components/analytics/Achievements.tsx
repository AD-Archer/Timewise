'use client';

import React from 'react';
import { useAchievements } from '../../contexts/AchievementsContext';
import { Award, Lock, Loader2 } from 'lucide-react';

const Achievements = () => {
  const { achievements, isLoading } = useAchievements();
  
  // Count unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlocked).length; // this is the number of achievements unlocked
  const totalCount = achievements.length; // this is the total number of achievements
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0; // this is the progress bar
  const formattedProgressPercentage = `${progressPercentage.toFixed(0)}%`; // this makes it look like a progress bar

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex justify-center items-center">
          <Loader2 className="animate-spin text-white mr-2" size={24} />
          <span className="text-white">Loading your achievements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-pink-500" size={20} />
            <h4 className="text-sm font-medium text-white">Achievement Progress</h4>
          </div>
          <span className="text-sm font-medium text-white">{unlockedCount}/{totalCount}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div 
            className="bg-pink-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: formattedProgressPercentage }}
          ></div>
        </div>
      </div>
      
      {/* Achievements list */}
      <div className="grid grid-cols-1 gap-4">
        {unlockedCount === 0 && (
          <div className="p-6 rounded-lg bg-white/5 flex flex-col items-center justify-center text-center">
            <Lock className="text-white/50 mb-2" size={24} />
            <h4 className="text-sm font-medium text-white mb-1">No Achievements Unlocked Yet</h4>
            <p className="text-xs text-white/70">Complete pomodoro sessions to unlock achievements!</p>
          </div>
        )}
        
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
              achievement.unlocked 
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30' 
                : 'bg-white/5'
            }`}
          >
            <div>
              <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
              <p className="text-xs text-white/70">{achievement.description}</p>
            </div>
            {achievement.unlocked ? (
              <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded-full self-start sm:self-auto">Unlocked</span>
            ) : (
              <span className="text-white/50 text-xs px-2 py-1 bg-white/5 rounded-full self-start sm:self-auto">Locked</span>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-white/50 text-center p-2">
        Complete pomodoro sessions to unlock more achievements! 
        {/* I lied there are no more achievements */}
      </div>
    </div>
  );
};

export default Achievements;