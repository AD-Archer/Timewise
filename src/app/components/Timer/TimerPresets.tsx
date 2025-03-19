'use client';

import React, { useState, useEffect } from 'react';
import { useTimer, TimerPreset } from '../../contexts/TimerContext';
import { Clock, Plus, Trash2, Check, X, Edit, Save } from 'lucide-react';
import useTabVisibility from '../../hooks/useTabVisibility';

/**
 * TimerPresets component
 * Displays and manages timer presets
 * Persists across tab changes
 */
const TimerPresets = () => {
  const { presets, activePresetId, applyPreset, deletePreset, saveCurrentAsPreset, updatePreset } = useTimer();
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { isVisible } = useTabVisibility('timer');

  // Check if we're on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Format seconds to minutes for display
  const formatMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  // Handle saving a new preset
  const handleSaveNewPreset = () => {
    if (newPresetName.trim()) {
      saveCurrentAsPreset(newPresetName.trim());
      setNewPresetName('');
      setIsCreating(false);
    }
  };

  // Handle canceling preset creation
  const handleCancelCreate = () => {
    setNewPresetName('');
    setIsCreating(false);
  };

  // Start editing a preset name
  const startEditing = (preset: TimerPreset) => {
    setEditingPresetId(preset.id);
    setEditName(preset.name);
  };

  // Cancel editing a preset name
  const cancelEditing = () => {
    setEditingPresetId(null);
    setEditName('');
  };

  // Save edited preset name
  const saveEditedName = (id: string) => {
    if (editName.trim()) {
      updatePreset(id, { name: editName.trim() });
      setEditingPresetId(null);
      setEditName('');
    }
  };

  return (
    <div className={`backdrop-blur-sm bg-white/10 rounded-xl p-4 md:p-6 shadow-2xl w-full md:w-auto ${!isVisible ? 'hidden' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Timer Presets</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm">New Preset</span>
          </button>
        )}
      </div>

      {/* Create new preset form */}
      {isCreating && (
        <div className="mb-4 p-3 bg-white/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name"
              className="flex-1 px-3 py-1.5 bg-white/30 text-white placeholder-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancelCreate}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <X size={16} />
              <span className="text-sm">Cancel</span>
            </button>
            <button
              onClick={handleSaveNewPreset}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={!newPresetName.trim()}
            >
              <Save size={16} />
              <span className="text-sm">Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Presets list */}
      <div className={`space-y-2 overflow-y-auto pr-1 custom-scrollbar ${isMobile ? 'max-h-[250px]' : 'max-h-[300px]'}`}>
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`p-3 rounded-lg transition-all ${
              activePresetId === preset.id
                ? 'bg-pink-600/40 border border-pink-500'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {editingPresetId === preset.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white/30 text-white placeholder-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditedName(preset.id)}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h3 className="font-medium text-white">{preset.name}</h3>
                    {!['default', 'short-focus', 'long-focus'].includes(preset.id) && (
                      <button
                        onClick={() => startEditing(preset)}
                        className="ml-2 p-1 text-white/60 hover:text-white/90"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div className="text-xs text-white/70 mt-1 flex items-center gap-2 flex-wrap">
                  <Clock size={12} className="inline" />
                  <span>
                    {formatMinutes(preset.durations.pomodoro)}m / {formatMinutes(preset.durations.shortBreak)}m / {formatMinutes(preset.durations.longBreak)}m
                  </span>
                  <span className="mx-1">•</span>
                  <span>{preset.targetPomodoros} pomodoros</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activePresetId !== preset.id && (
                  <button
                    onClick={() => applyPreset(preset.id)}
                    className="p-1.5 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
                    title="Apply preset"
                  >
                    <Check size={16} />
                  </button>
                )}
                {!['default', 'short-focus', 'long-focus'].includes(preset.id) && (
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="p-1.5 bg-white/20 text-white rounded-md hover:bg-red-500/70 transition-colors"
                    title="Delete preset"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimerPresets; 