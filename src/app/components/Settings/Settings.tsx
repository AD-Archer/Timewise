'use client'
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useBackground } from '../../contexts/BackgroundContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useAchievements } from '../../contexts/AchievementsContext';
import { useMood } from '../../contexts/MoodContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PlaylistInfo } from '../../contexts/SettingsContext';
import Image from 'next/image';
import { Target, Clock, Flame, Award, Trash2 } from 'lucide-react';
import Achievements from '../Analytics/Achievements'; 
import AnalyticsDisplay from '../Analytics/AnalyticsDisplay';
import { format } from 'date-fns';

interface SettingsProps {
  currentTab: 'mood' | 'timer' | 'chatbot' | 'background' | 'music' | 'analytics' | 'achievements';
}

const Settings = ({ currentTab }: SettingsProps) => {
  const { 
    settings, 
    updateSettings, 
    spotifyPlaylists, 
    currentSpotifyPlaylistUri, 
    setCurrentSpotifyPlaylistUri,
    clearChatHistory,
    exportChatHistory
  } = useSettings();
  const { backgrounds, currentBackground, setBackground } = useBackground();
  const { analytics, resetAnalytics } = useAnalytics();
  const { resetAchievements } = useAchievements();
  const { entries, deleteEntry, tags, clearAllEntries } = useMood();
  const { user } = useAuth();
  const [pomodoro, setPomodoro] = useState(Math.floor(settings.durations.pomodoro / 60));
  const [shortBreak, setShortBreak] = useState(Math.floor(settings.durations.shortBreak / 60));
  const [longBreak, setLongBreak] = useState(Math.floor(settings.durations.longBreak / 60));
  const [targetPomodoros, setTargetPomodoros] = useState(settings.targetPomodoros);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchTag, setSelectedSearchTag] = useState<string | null>(null);

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
    setter(value === '' ? NaN : Math.max(Number(value), 0)); // Use NaN for empty values
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
      videos: [],
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
      autoStartBreaks: true,
      autoStartPomodoros: true,
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

  // Render mood icon based on mood value (1-5 scale, where 1 is good and 5 is bad)
  const renderMoodIcon = (mood: number) => {
    const moodValue = 6 - mood; // Convert to 5=good, 1=bad scale for display
    switch (moodValue) {
      case 1: return <span className="text-red-500">😞</span>;
      case 2: return <span className="text-orange-500">😕</span>;
      case 3: return <span className="text-yellow-500">😐</span>;
      case 4: return <span className="text-green-500">🙂</span>;
      case 5: return <span className="text-pink-500">😍</span>;
      default: return null;
    }
  };

  // Filter mood entries based on search term and selected tag
  const filteredEntries = entries.filter(entry => {
    const matchesSearchTerm = searchTerm === '' || 
      (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedSearchTag === null || 
      (entry.tags && entry.tags.includes(selectedSearchTag));
    
    return matchesSearchTerm && matchesTag;
  });

  if (currentTab === 'mood') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Mood Tracker Settings</h3>
          <button 
            onClick={() => {
              clearAllEntries();
              // Toast notification will be shown by the clearAllEntries function
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete All Entries
          </button>
        </div>
        
        {/* Mood History Visibility */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Display Settings</h4>
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Show mood history on dashboard:</label>
            <input 
              type="checkbox" 
              checked={settings.showMoodHistory !== false}
              onChange={(e) => updateSettings({ showMoodHistory: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
        </div>
        
        {/* Data Management */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Data Management</h4>
          <p className="text-xs text-white/70 mb-3">
            You currently have {entries.length} mood entries stored.
          </p>
        </div>

        {/* Mood Entries Management */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Manage Mood Entries</h4>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <select
                value={selectedSearchTag || ''}
                onChange={(e) => setSelectedSearchTag(e.target.value === '' ? null : e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">All tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Entries Table */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No mood entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white/70 uppercase bg-white/5">
                  <tr>
                    <th className="px-2 py-2">Date & Mood</th>
                    <th className="px-2 py-2">Note</th>
                    <th className="px-2 py-2">Tags</th>
                    <th className="px-2 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.slice().reverse().map((entry, index) => (
                    <tr key={`${entry.id}-${index}`} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-2 py-2">
                        <div className="flex items-center">
                          {renderMoodIcon(entry.mood)}
                          <span className="ml-2 text-white">{format(new Date(entry.date), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-white">
                        {entry.note || <span className="text-white/40 text-xs">No note</span>}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          {entry.tags && entry.tags.length > 0 ? (
                            entry.tags.map((tag, tagIndex) => (
                              <span key={`${tag}-${tagIndex}`} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-white/40 text-xs">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this mood entry?')) {
                                deleteEntry(entry.id);
                              }
                            }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

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
              value={isNaN(pomodoro) ? '' : pomodoro} 
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

  if (currentTab === 'chatbot') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Chatbot Settings</h3>
        </div>
        
        {/* Chatbot Enablement */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Chatbot Features</h4>
          
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Enable chatbot assistant:</label>
            <input 
              type="checkbox" 
              checked={settings.chatbotEnabled !== false}
              onChange={(e) => updateSettings({ chatbotEnabled: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Proactive suggestions:</label>
            <input 
              type="checkbox" 
              checked={settings.chatbotProactiveSuggestions !== false}
              onChange={(e) => updateSettings({ chatbotProactiveSuggestions: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
          
          <p className="text-xs text-white/50 mt-1">
            When enabled, the chatbot will occasionally offer productivity tips and suggestions.
          </p>
        </div>
        
        {/* Chatbot Personality */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Chatbot Personality</h4>
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Personality style:</label>
            <select
              value={settings.chatbotPersonality || 'supportive'}
              onChange={(e) => updateSettings({ chatbotPersonality: e.target.value as 'supportive' | 'direct' | 'humorous' | 'analytical' })}
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            >
              <option value="supportive">Supportive & Encouraging</option>
              <option value="direct">Direct & Efficient</option>
              <option value="humorous">Humorous & Light</option>
              <option value="analytical">Analytical & Detailed</option>
            </select>
          </div>
        </div>
        
        {/* API Settings */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">API Settings</h4>
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Model:</label>
            <select
              value={settings.chatbotModel || 'gpt-3.5-turbo'}
              onChange={(e) => updateSettings({ chatbotModel: e.target.value as 'gpt-3.5-turbo' | 'gpt-4' })}
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
              <option value="gpt-4">GPT-4 (More Capable)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <label className="text-white/80 text-xs">Custom API Key (optional):</label>
            <input 
              type="password" 
              value={settings.customOpenAIKey || ''}
              onChange={(e) => updateSettings({ customOpenAIKey: e.target.value })}
              placeholder="sk-..."
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <p className="text-xs text-white/50 mt-1">
            If provided, your own API key will be used instead of the shared one. Your key is stored locally and never sent to our servers.
          </p>
        </div>
        
        {/* Data Privacy */}
        <div className="space-y-2 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white">Privacy Settings</h4>
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs">Enable chat history export:</label>
            <input 
              type="checkbox" 
              checked={settings.chatExportEnabled !== false}
              onChange={(e) => updateSettings({ chatExportEnabled: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                  clearChatHistory();
                }
              }}
              className="text-xs px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-white rounded transition-colors"
            >
              Clear Chat History
            </button>
            {settings.chatExportEnabled && (
              <button 
                onClick={exportChatHistory}
                className="text-xs px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-white rounded transition-colors"
              >
                Export Chat History
              </button>
            )}
          </div>
        </div>
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
        
        {/* Music Service Selection */}
        <div className="p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Music Service</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Choose your preferred music player:</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => updateSettings({ preferredMusicService: 'youtube' })}
                className={`px-3 py-1 text-xs rounded-lg ${
                  settings.preferredMusicService === 'youtube'
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => updateSettings({ preferredMusicService: 'spotify' })}
                className={`px-3 py-1 text-xs rounded-lg ${
                  settings.preferredMusicService === 'spotify'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Spotify
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs for YouTube and Spotify */}
        <div className="flex border-b border-white/10 mb-4">
          <button 
            className={`px-4 py-2 text-sm font-medium ${currentSpotifyPlaylistUri ? 'text-white/50' : 'text-white border-b-2 border-pink-500'}`}
            onClick={() => setCurrentSpotifyPlaylistUri(null)}
          >
            YouTube
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${currentSpotifyPlaylistUri ? 'text-white border-b-2 border-pink-500' : 'text-white/50'}`}
            onClick={() => {
              if (spotifyPlaylists.length > 0 && !currentSpotifyPlaylistUri) {
                setCurrentSpotifyPlaylistUri(spotifyPlaylists[0].uri);
              }
            }}
          >
            Spotify
          </button>
        </div>
        
        {currentSpotifyPlaylistUri ? (
          // Spotify Playlists Section
          <>
            <div className="space-y-2 p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white">Spotify Playlists</h4>
              <p className="text-xs text-white/70">
                Connect to Spotify using the player in the bottom left corner to access your playlists.
              </p>
            </div>
            
            {/* Saved Spotify Playlists - Scrollable */}
            <div className="flex-1 min-h-0">
              <h4 className="text-sm font-medium text-white mb-2">Your Spotify Playlists</h4>
              <div className="overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: '200px' }}>
                {spotifyPlaylists?.length > 0 ? (
                  <div className="space-y-2">
                    {spotifyPlaylists.map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className={`p-2 rounded-lg flex items-center justify-between ${
                          currentSpotifyPlaylistUri === playlist.uri 
                            ? 'bg-green-600/20 border border-green-500/50' 
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {playlist.imageUrl && (
                            <div className="w-10 h-10 relative rounded overflow-hidden mr-2 flex-shrink-0">
                              <Image
                                src={playlist.imageUrl}
                                alt={playlist.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{playlist.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => setCurrentSpotifyPlaylistUri(playlist.uri)}
                            className={`px-2 py-1 text-xs rounded ${
                              currentSpotifyPlaylistUri === playlist.uri
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {currentSpotifyPlaylistUri === playlist.uri ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/50 italic">
                    No Spotify playlists found. Connect to Spotify using the player in the bottom left corner.
                  </p>
                )}
              </div>
            </div>
            
            {/* Guide for Spotify */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-1">How to use Spotify</h4>
              <ol className="text-xs text-white/70 list-decimal pl-4 space-y-1">
                <li>Click the Spotify icon in the bottom left corner</li>
                <li>Log in to your Spotify account</li>
                <li>Your playlists will appear here automatically</li>
                <li>Select a playlist to play during your focus sessions</li>
                <li>Control playback from the mini player</li>
              </ol>
              <p className="text-xs text-white/50 mt-2">
                Note: Spotify playback requires a Spotify Premium account
              </p>
            </div>
          </>
        ) : (
          // YouTube Playlists Section (Original Content)
          <>
            {/* Add New Playlist - Fixed at top */}
            <div className="space-y-2 p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-white">Add New YouTube Playlist</h4>
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
              <h4 className="text-sm font-medium text-white mb-2">Saved YouTube Playlists</h4>
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
              <h4 className="text-sm font-medium text-white mb-1">How to add a YouTube playlist</h4>
              <ol className="text-xs text-white/70 list-decimal pl-4 space-y-1">
                <li>Go to YouTube and find a playlist you like</li>
                <li>Copy the playlist URL from your browser</li>
                <li>Paste it in the input field above</li>
                <li>Give it a name (optional)</li>
                <li>Click &quot;Add Playlist&quot;</li>
              </ol>
            </div>
          </>
        )}
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
        
        {/* Timer Data Charts */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Timer Activity</h3>
          
          {/* Import the AnalyticsDisplay component to show the charts */}
          <div className="bg-transparent">
            <AnalyticsDisplay showCards={false} />
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'achievements') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <button 
            onClick={resetAchievements}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Reset Achievements
          </button>
        </div>
        <Achievements />
      </div>
    );
  }

  return null;
};

export default Settings;
