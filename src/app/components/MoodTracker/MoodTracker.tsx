'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMood } from '../../contexts/MoodContext';
import { useSettings } from '../../contexts/SettingsContext';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { 
  ValueType, 
  NameType 
} from 'recharts/types/component/DefaultTooltipContent';
import { Smile, Frown, Meh, AlertCircle, Heart, Plus, X, Loader2 } from 'lucide-react';

const MoodTracker = () => {
  const { entries, tags, addEntry, addTag, getEntriesByDateRange, getAverageMood, isLoading, requiresAuth } = useMood();
  const { settings, updateSettings } = useSettings();
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>(settings?.moodChartTimeframe || 'week');
  const [averageMood, setAverageMood] = useState<number | null>(null);
  
  interface ChartDataPoint {
    date: string;
    mood: number;
  }
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Calculate date ranges based on timeframe
  const getDateRange = useCallback(() => {
    const endDate = new Date();
    let startDate;
    
    if (timeframe === 'week') {
      startDate = subDays(endDate, 7);
    } else if (timeframe === 'month') {
      startDate = subMonths(endDate, 1);
    } else { // year
      startDate = subYears(endDate, 1);
    }
    
    return {
      start: startOfDay(startDate).toISOString(),
      end: endOfDay(endDate).toISOString()
    };
  }, [timeframe]);

  // Update chart data and average mood when entries or timeframe changes
  useEffect(() => {
    const { start, end } = getDateRange();
    const filteredEntries = getEntriesByDateRange(start, end);
    const avg = getAverageMood(start, end);
    
    // Convert average mood to new scale (5=good, 1=bad)
    setAverageMood(avg !== null ? 6 - avg : null);
    
    // Prepare data for chart
    const data = filteredEntries.map(entry => ({
      date: format(new Date(entry.date), 'MM/dd'),
      mood: 6 - entry.mood // Convert mood value to new scale (5=good, 1=bad)
    }));
    
    setChartData(data);
  }, [getDateRange, getEntriesByDateRange, getAverageMood, entries]);

  // Update settings when timeframe changes, but use a ref to prevent unnecessary updates
  const prevTimeframeRef = useRef(timeframe);
  useEffect(() => {
    // Only update settings if timeframe actually changed
    if (prevTimeframeRef.current !== timeframe) {
      updateSettings({ moodChartTimeframe: timeframe });
      prevTimeframeRef.current = timeframe;
    }
  }, [timeframe, updateSettings]);

  // Handle mood selection
  const handleMoodSelect = (mood: number) => {
    setCurrentMood(mood);
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      addTag(newTag.trim());
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
      setShowAddTag(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentMood !== null) {
      // Convert mood back to original scale for storage (1=good, 5=bad)
      const storageMood = 6 - currentMood;
      addEntry(storageMood, note, selectedTags);
      setCurrentMood(null);
      setNote('');
      setSelectedTags([]);
    }
  };

  // Render mood icon based on mood value
  const renderMoodIcon = (mood: number, size = 24) => {
    switch (mood) {
      case 1: return <Frown size={size} className="text-red-500" />;
      case 2: return <AlertCircle size={size} className="text-orange-500" />;
      case 3: return <Meh size={size} className="text-yellow-500" />;
      case 4: return <Smile size={size} className="text-green-500" />;
      case 5: return <Heart size={size} className="text-pink-500" />;
      default: return null;
    }
  };

  // Custom tick formatter for Y-axis to render emotion icons
  type CustomYAxisTickProps = {
    x: number;
    y: number;
    payload: {
      value: number;
    };
  };

  const CustomYAxisTick = ({ x, y, payload }: CustomYAxisTickProps) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject width="24" height="24" x="-28" y="-12">
          {renderMoodIcon(payload.value)}
        </foreignObject>
      </g>
    );
  };

  // Custom tooltip formatter to show emotion icon
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const mood = payload[0].value as number;
      return (
        <div className="bg-black/80 p-2 rounded-md">
          <p className="text-white text-sm">{`Date: ${label}`}</p>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Mood:</span>
            {renderMoodIcon(mood)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 md:p-8 shadow-2xl w-full max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">Mood Tracker</h1>
      
      {requiresAuth && (
        <div className="mb-6 p-4 bg-pink-600/30 border border-pink-500 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Sign in required</h3>
              <p className="text-white/90">
                You need to sign in to use the Mood Tracker. Your mood data will be securely stored in your account.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center mb-4">
          <Loader2 className="animate-spin text-white mr-2" size={24} />
          <span className="text-white">Loading your mood data...</span>
        </div>
      )}
      
      {/* Mood Input Section */}
      <div className="mb-8">
        <h2 className="text-xl text-white mb-4">How are you feeling today?</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mood Scale - 5=Good (left) to 1=Bad (right) */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between text-white text-sm px-2">
              <span>Good</span>
              <span>Bad</span>
            </div>
            <div className="flex justify-between items-center">
              {[5, 4, 3, 2, 1].map(mood => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => handleMoodSelect(mood)}
                  className={`p-3 rounded-full transition-all ${
                    currentMood === mood 
                      ? 'bg-pink-600 scale-110' 
                      : 'bg-white/20 hover:bg-white/30'
                  } ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Mood level ${mood}`}
                  disabled={requiresAuth}
                >
                  {renderMoodIcon(mood, 32)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Note Input */}
          <div>
            <label htmlFor="note" className="block text-white mb-2">Add a note (optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling?"
              className={`w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
              rows={2}
              disabled={requiresAuth}
            />
          </div>
          
          {/* Emotion Tags */}
          <div>
            <label className="block text-white mb-2">Emotions (select all that apply)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  } ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={requiresAuth}
                >
                  {tag}
                </button>
              ))}
              
              {/* Add New Tag Button */}
              <button
                type="button"
                onClick={() => setShowAddTag(true)}
                className={`px-3 py-1 rounded-full text-sm bg-white/10 text-white/80 hover:bg-white/20 flex items-center gap-1 ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={requiresAuth}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
            
            {/* Add New Tag Input */}
            {showAddTag && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter new emotion"
                  className={`flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={requiresAuth}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={`px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 ${requiresAuth ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={requiresAuth}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTag(false);
                    setNewTag('');
                  }}
                  className="p-2 text-white/60 hover:text-white"
                  disabled={requiresAuth}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={currentMood === null || requiresAuth}
            className="w-full py-3 bg-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-700 transition-colors"
          >
            {requiresAuth ? 'Sign in to Save Mood' : 'Save Mood'}
          </button>
        </form>
      </div>
      
      {/* Mood History Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">Your Mood History</h2>
          
          {/* Timeframe Selector */}
          <div className="flex justify-end mb-4">
            <div className="flex bg-white/10 rounded-full p-1">
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
              <button
                onClick={() => setTimeframe('year')}
                className={`px-3 py-1 rounded-full text-sm ${
                  timeframe === 'year' 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>
        
        {entries.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <p>No mood entries yet. Start tracking your mood above!</p>
          </div>
        ) : (
          <>
            {/* Average Mood */}
            {averageMood !== null && (
              <div className="mb-4 p-4 bg-white/10 rounded-lg flex items-center justify-between">
                <span className="text-white">Average Mood:</span>
                <div className="flex items-center gap-2">
                  {renderMoodIcon(Math.round(averageMood))}
                  <span className="text-white font-bold">{averageMood.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            {/* Mood Chart */}
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
                      domain={[5, 1]} 
                      ticks={[5, 4, 3, 2, 1]} 
                      stroke="rgba(255,255,255,0.5)"
                      tick={CustomYAxisTick}
                      label={{ value: 'Mood', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.5)' } }}
                    />
                    <Tooltip 
                      content={CustomTooltip}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/60">
                  <p>Not enough data to display chart</p>
                </div>
              )}
            </div>
            
            {/* Recent Entries */}
            <div className="mt-6">
              <h3 className="text-lg text-white mb-2">Recent Entries</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {entries.slice().reverse().slice(0, 5).map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className="p-3 bg-white/10 rounded-lg flex items-start gap-3">
                    <div className="mt-1">
                      {renderMoodIcon(6 - entry.mood)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white/70 text-sm">
                        {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                      </div>
                      {entry.note && (
                        <p className="text-white mt-1">{entry.note}</p>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <span key={`${tag}-${tagIndex}`} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodTracker; 