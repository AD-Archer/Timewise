'use client'
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useBackground } from '../contexts/BackgroundContext';

interface SettingsProps {
  currentTab: 'timer' | 'background' | 'music';
}

const Settings = ({ currentTab }: SettingsProps) => {
  const { settings, updateSettings } = useSettings();
  const { backgrounds, currentBackground, setBackground } = useBackground();
  const [pomodoro, setPomodoro] = useState(Math.floor(settings.durations.pomodoro / 60));
  const [shortBreak, setShortBreak] = useState(Math.floor(settings.durations.shortBreak / 60));
  const [longBreak, setLongBreak] = useState(Math.floor(settings.durations.longBreak / 60));
  const [targetPomodoros, setTargetPomodoros] = useState(settings.targetPomodoros);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [playlistId, setPlaylistId] = useState('PL6NdkXsPL07KqOQymt2EyI03C01U9Opxi');

  useEffect(() => {
    setPomodoro(Math.floor(settings.durations.pomodoro / 60));
    setShortBreak(Math.floor(settings.durations.shortBreak / 60));
    setLongBreak(Math.floor(settings.durations.longBreak / 60));
    setTargetPomodoros(settings.targetPomodoros);
    setAutoStartBreaks(settings.autoStartBreaks);
    setAutoStartPomodoros(settings.autoStartPomodoros);
  }, [settings]);

  const applySettings = () => {
    updateSettings({
      durations: {
        pomodoro: pomodoro * 60,
        shortBreak: shortBreak * 60,
        longBreak: longBreak * 60,
      },
      targetPomodoros,
      autoStartBreaks,
      autoStartPomodoros,
    });
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setter(value === '' ? 0 : Math.max(Number(value), 0)); // Ensure it doesn't go below 0
  };

  if (currentTab === 'timer') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Timer Settings</h3>

        {/* Timer Durations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Pomodoro:</label>
            <input 
              type="number" 
              value={pomodoro === 0 ? '' : pomodoro}
              onChange={handleChange(setPomodoro)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Short Break:</label>
            <input 
              type="number" 
              value={shortBreak === 0 ? '' : shortBreak}
              onChange={handleChange(setShortBreak)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Long Break:</label>
            <input 
              type="number" 
              value={longBreak === 0 ? '' : longBreak}
              onChange={handleChange(setLongBreak)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Pomodoro Sequence Settings */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Pomodoros:</label>
            <input 
              type="number" 
              value={targetPomodoros}
              onChange={handleChange(setTargetPomodoros)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Auto-start Settings */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Auto-start Breaks:</label>
            <input 
              type="checkbox" 
              checked={autoStartBreaks}
              onChange={(e) => setAutoStartBreaks(e.target.checked)} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Auto-start Pomodoros:</label>
            <input 
              type="checkbox" 
              checked={autoStartPomodoros}
              onChange={(e) => setAutoStartPomodoros(e.target.checked)} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
        </div>

        <button 
          onClick={applySettings} 
          className="w-full py-1.5 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors duration-300 mt-3"
        >
          Apply
        </button>
      </div>
    );
  }

  if (currentTab === 'background') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Background Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          {backgrounds.map((bg, index) => (
            <button
              key={bg}
              onClick={() => setBackground(bg)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                currentBackground === bg ? 'border-pink-500 scale-105' : 'border-transparent hover:border-white/50'
              }`}
            >
              <img src={bg} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'music') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Music Settings</h3>
        <div className="space-y-2">
          <label className="text-white/80 text-xs block">YouTube Playlist ID:</label>
          <input 
            type="text" 
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            className="w-full px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <p className="text-xs text-white/50">
            Enter the playlist ID from a YouTube URL (e.g., PL6NdkXsPL07KqOQymt2EyI03C01U9Opxi)
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default Settings;
