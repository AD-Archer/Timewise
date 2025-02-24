'use client'
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useBackground } from '../contexts/BackgroundContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import type { PlaylistInfo } from '../contexts/SettingsContext';
import Image from 'next/image';
import { Target, Clock, Flame, Award } from 'lucide-react';

interface SettingsProps {
  currentTab: 'timer' | 'background' | 'music' | 'analytics';
}

const Settings = ({ currentTab }: SettingsProps) => {
  const { settings, updateSettings } = useSettings();
  const { backgrounds, currentBackground, setBackground } = useBackground();
  const { analytics, resetAnalytics } = useAnalytics();
  const [pomodoro, setPomodoro] = useState(Math.floor(settings.durations.pomodoro / 60));
  const [shortBreak, setShortBreak] = useState(Math.floor(settings.durations.shortBreak / 60));
  const [longBreak, setLongBreak] = useState(Math.floor(settings.durations.longBreak / 60));
  const [targetPomodoros, setTargetPomodoros] = useState(settings.targetPomodoros);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

  const addPlaylist = () => {
    const match = newPlaylistUrl.match(/[?&]list=([^&]+)/);
    if (!match) {
      alert('Please enter a valid YouTube playlist URL');
      return;
    }

    const playlistId = match[1];
    
    // Check if playlist already exists
    if (settings.playlists?.some(p => p.id === playlistId)) {
      alert('This playlist has already been added');
      return;
    }

    const newPlaylist: PlaylistInfo = {
      id: playlistId,
      name: newPlaylistName || 'Untitled Playlist',
      url: newPlaylistUrl,
    };

    const updatedPlaylists = [...(settings.playlists || []), newPlaylist];
    
    updateSettings({
      playlists: updatedPlaylists,
      currentPlaylistId: settings.currentPlaylistId || playlistId,
    });

    setNewPlaylistUrl('');
    setNewPlaylistName('');
  };

  const removePlaylist = (id: string) => {
    updateSettings({
      playlists: settings.playlists.filter(p => p.id !== id),
      currentPlaylistId: settings.currentPlaylistId === id ? null : settings.currentPlaylistId,
    });
  };

  const resetTimer = () => {
    const defaultTimer = {
      durations: {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 10 * 60,
      },
      targetPomodoros: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    };

    updateSettings(defaultTimer);
  };

  const resetPlaylists = () => {
    updateSettings({
      playlists: [],
      currentPlaylistId: null,
    });
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  if (currentTab === 'timer') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Timer Settings</h3>
          <button 
            onClick={resetTimer}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Reset to Default
          </button>
        </div>

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

        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Enable Sounds:</label>
            <input 
              type="checkbox" 
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>

          {settings.soundEnabled && (
            <div className="flex items-center gap-2">
              <label className="text-white/80 text-xs">Volume:</label>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
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
              <Image 
                src={bg} 
                alt={`Background ${index + 1}`} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'music') {
    return (
      <div className="space-y-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Music Settings</h3>
          <button 
            onClick={resetPlaylists}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Clear All Playlists
          </button>
        </div>
        
        {/* Add New Playlist - Fixed at top */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Add New Playlist</h4>
          <div className="space-y-2">
            <input 
              type="text"
              placeholder="Playlist name (optional)"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <input 
              type="text" 
              placeholder="https://www.youtube.com/playlist?list=..."
              value={newPlaylistUrl}
              onChange={(e) => setNewPlaylistUrl(e.target.value)}
              className="w-full px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button 
              onClick={addPlaylist}
              disabled={!newPlaylistUrl}
              className="w-full py-1.5 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Playlist
            </button>
          </div>
        </div>

        {/* Saved Playlists - Scrollable */}
        <div className="flex-1 min-h-0">
          <h4 className="text-sm font-medium text-white mb-2">Saved Playlists</h4>
          <div className="overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: '200px' }}>
            {settings.playlists?.length > 0 ? (
              <div className="space-y-2">
                {settings.playlists.map((playlist) => (
                  <div 
                    key={playlist.id} 
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      settings.currentPlaylistId === playlist.id 
                        ? 'bg-pink-600/20 border border-pink-500/50' 
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{playlist.name}</p>
                      <p className="text-xs text-white/50 truncate">{playlist.url}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => updateSettings({ currentPlaylistId: playlist.id })}
                        className={`px-2 py-1 text-xs rounded ${
                          settings.currentPlaylistId === playlist.id
                            ? 'bg-pink-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {settings.currentPlaylistId === playlist.id ? 'Selected' : 'Select'}
                      </button>
                      <button
                        onClick={() => removePlaylist(playlist.id)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50 italic">No playlists added yet</p>
            )}
          </div>
        </div>

        {/* Guide - Fixed at bottom */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">How to add music:</h4>
          <ul className="space-y-2 text-xs text-white/70">
            <li className="flex gap-2">
              <span>1.</span>
              <span>Find or create a YouTube playlist</span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>Click 'Share' on the playlist</span>
            </li>
            <li className="flex gap-2">
              <span>3.</span>
              <span>Copy the playlist URL and paste it above</span>
            </li>
            <li className="flex gap-2">
              <span>4.</span>
              <p>Don&apos;t see your playlist? Make sure it&apos;s public or unlisted</p>
            </li>
          </ul>

          <div className="mt-3 text-xs text-white/50">
            <p>Recommended: Lofi, ambient, or instrumental music for focus</p>
            <p className="mt-1">Example playlists:</p>
            <ul className="mt-1 space-y-1 text-pink-400">
              <li>• Lofi Girl - beats to study/relax to</li>
              <li>• ChilledCow - peaceful piano</li>
              <li>• Ambient Worlds - background music</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'analytics') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Statistics</h3>
          <button 
            onClick={resetAnalytics}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Reset Stats
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
      </div>
    );
  }

  return null;
};

export default Settings;
