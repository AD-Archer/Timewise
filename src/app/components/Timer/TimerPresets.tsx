'use client';

import React, { useState, useEffect } from 'react';
import { useTimer, TimerPreset } from '../../contexts/TimerContext';
import { Clock, Plus, Trash2, Check, X, Edit, Save, Target, ChevronUp, ChevronDown } from 'lucide-react';
import useTabVisibility from '../../hooks/useTabVisibility';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * TimerPresets component
 * Displays and manages timer presets
 * Now functions as a popup triggered by a bar at the top of the timer
 */
const TimerPresets = () => {
  const { presets, activePresetId, applyPreset, deletePreset, saveCurrentAsPreset, updatePreset, setTimeLeft, currentMode } = useTimer();
  const { updateSettings } = useSettings();
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { isVisible } = useTabVisibility('timer');
  const [isOpen, setIsOpen] = useState(false);

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

  // Close popup when tab changes
  useEffect(() => {
    if (!isVisible) {
      setIsOpen(false);
    }
  }, [isVisible]);

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

  // Handle applying a preset with immediate time update
  const handleApplyPreset = (id: string) => {
    applyPreset(id);
    
    // Find the preset to get its durations
    const preset = presets.find(p => p.id === id);
    if (preset) {
      // Update the timer immediately with the new duration based on current mode
      setTimeLeft(preset.durations[currentMode]);
    }
    
    // Close the popup after applying a preset
    setIsOpen(false);
  };

  // Toggle popup visibility
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Get the active preset name or default text
  const getActivePresetName = () => {
    if (activePresetId) {
      const activePreset = presets.find(p => p.id === activePresetId);
      return activePreset ? activePreset.name : 'Select Preset';
    }
    return 'Select Preset';
  };

  return (
    <>
      {/* Presets Bar - Positioned above the timer */}
      <div className={`w-full max-w-md mx-auto mb-6 ${!isVisible ? 'hidden' : ''}`}>
        <button
          onClick={togglePopup}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-t-xl shadow-lg flex items-center justify-between transition-all"
        >
          <div className="flex items-center">
            <Clock size={18} className="mr-2" />
            <span className="font-medium">{getActivePresetName()}</span>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Popup Overlay */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4 transition-opacity duration-300 ${!isVisible ? 'hidden' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          {/* Popup Content - Stop propagation to prevent closing when clicking inside */}
          <div 
            className="backdrop-blur-xl bg-white/10 rounded-xl p-6 shadow-2xl w-full max-w-md mx-auto transition-all transform duration-300 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-white">Timer Presets</h2>
              <div className="flex items-center gap-2">
                {!isCreating && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-medium">New Preset</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Create new preset form */}
            {isCreating && (
              <div className="mb-5 p-4 bg-white/20 rounded-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="flex-1 px-3 py-2 bg-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={handleCancelCreate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X size={16} />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveNewPreset}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={!newPresetName.trim()}
                  >
                    <Save size={16} />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              </div>
            )}

            {/* Presets list */}
            <div className={`space-y-3 overflow-y-auto pr-1 custom-scrollbar ${isMobile ? 'max-h-[250px]' : 'max-h-[400px]'}`}>
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-4 rounded-lg transition-all ${
                    activePresetId === preset.id
                      ? 'bg-pink-600/40 border border-pink-500/70 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 border border-transparent'
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
                            className="flex-1 px-3 py-2 bg-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditedName(preset.id)}
                            className="p-1.5 text-green-400 hover:text-green-300 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
                            title="Save name"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <h3 className="font-semibold text-white text-lg">{preset.name}</h3>
                          {!['default', 'short-focus', 'long-focus'].includes(preset.id) && (
                            <button
                              onClick={() => startEditing(preset)}
                              className="ml-2 p-1 text-white/60 hover:text-white/90"
                              title="Edit name"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-white/80 mt-2 flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-pink-300" />
                          <span>
                            {formatMinutes(preset.durations.pomodoro)}m / {formatMinutes(preset.durations.shortBreak)}m / {formatMinutes(preset.durations.longBreak)}m
                          </span>
                        </div>
                        <span className="mx-1 text-white/50">•</span>
                        <div className="flex items-center gap-1.5">
                          <Target size={14} className="text-pink-300" />
                          <span>{preset.targetPomodoros} pomodoros</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {activePresetId !== preset.id && (
                        <button
                          onClick={() => handleApplyPreset(preset.id)}
                          className="p-2 bg-pink-600/50 text-white rounded-lg hover:bg-pink-600/80 transition-colors"
                          title="Apply preset"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {!['default', 'short-focus', 'long-focus'].includes(preset.id) && (
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="p-2 bg-white/20 text-white rounded-lg hover:bg-red-500/70 transition-colors"
                          title="Delete preset"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimerPresets;