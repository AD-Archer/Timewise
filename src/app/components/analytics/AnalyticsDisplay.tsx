'use client';

import React from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { Clock, Target, Flame, Award } from 'lucide-react';

const AnalyticsDisplay = () => {
  const { analytics } = useAnalytics();

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
        <Target className="text-pink-500 mb-2" size={24} />
        <div className="text-2xl font-bold text-white">{analytics.totalPomodoros}</div>
        <div className="text-xs text-white/70">Total Pomodoros</div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
        <Clock className="text-pink-500 mb-2" size={24} />
        <div className="text-2xl font-bold text-white">
          {formatTime(Math.floor(analytics.totalFocusTime / 60))}
        </div>
        <div className="text-xs text-white/70">Total Focus Time</div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
        <Flame className="text-pink-500 mb-2" size={24} />
        <div className="text-2xl font-bold text-white">{analytics.currentStreak}</div>
        <div className="text-xs text-white/70">Current Streak</div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
        <Award className="text-pink-500 mb-2" size={24} />
        <div className="text-2xl font-bold text-white">{analytics.longestStreak}</div>
        <div className="text-xs text-white/70">Longest Streak</div>
      </div>
    </div>
  );
};

export default AnalyticsDisplay; 