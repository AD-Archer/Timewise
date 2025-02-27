'use client';

import React from 'react';
import { useAchievements } from '../../contexts/AchievementsContext';

const Achievements = () => {
  const { achievements } = useAchievements();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
      <div className="grid grid-cols-1 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg flex items-center justify-between ${
              achievement.unlocked ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5'
            }`}
          >
            <div>
              <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
              <p className="text-xs text-white/70">{achievement.description}</p>
            </div>
            {achievement.unlocked && (
              <span className="text-green-500 text-xs font-bold">Unlocked</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;