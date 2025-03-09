'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { Clock, Target, Flame, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

interface AnalyticsDisplayProps {
  showCards?: boolean;
}

interface ChartDataPoint {
  date: string;
  pomodoros: number;
  focusTime: number;
}

const AnalyticsDisplay = ({ showCards = true }: AnalyticsDisplayProps) => {
  const { analytics } = useAnalytics();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Prepare chart data based on timeframe
  useEffect(() => {
    const days = timeframe === 'week' ? 7 : 30;
    const endDate = new Date();
    
    // Create an array of dates for the selected timeframe
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = subDays(endDate, i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    // Map the date range to chart data
    const data = dateRange.map(date => {
      const dayStat = analytics.dailyStats.find(stat => stat.date === date);
      return {
        date: format(parseISO(date), 'MM/dd'),
        pomodoros: dayStat ? dayStat.completedPomodoros : 0,
        focusTime: dayStat ? Math.round(dayStat.totalFocusTime / 60) : 0, // Convert to minutes
      };
    });
    
    setChartData(data);
  }, [analytics.dailyStats, timeframe]);

  return (
    <div className="space-y-6">
      {/* Stats Cards - Only show if showCards prop is true */}
      {showCards && (
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
      )}

      {/* Timer Data Chart Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-white font-semibold">Timer Activity</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 rounded-full text-sm ${
                timeframe === 'week' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-full text-sm ${
                timeframe === 'month' 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        {/* Pomodoro Count Chart */}
        <div className="mb-8">
          <h3 className="text-white/80 mb-2 text-sm">Completed Pomodoros</h3>
          <div className="h-64 w-full bg-white/5 rounded-lg p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} pomodoros`, 'Completed']}
                  />
                  <Bar 
                    dataKey="pomodoros" 
                    fill="#ec4899" 
                    radius={[4, 4, 0, 0]}
                    name="Pomodoros"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60">
                <p>No timer data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Focus Time Chart */}
        <div>
          <h3 className="text-white/80 mb-2 text-sm">Daily Focus Time (minutes)</h3>
          <div className="h-64 w-full bg-white/5 rounded-lg p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} minutes`, 'Focus Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focusTime" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Focus Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60">
                <p>No timer data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDisplay; 