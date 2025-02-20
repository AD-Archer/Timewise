'use client';

import React, { useState } from 'react';
import { X, Clock, Image, Music } from 'lucide-react';
import Settings from './Settings';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'timer' | 'background' | 'music';

const SettingsPopup = ({ isOpen, onClose }: SettingsPopupProps) => {
  const [currentTab, setCurrentTab] = useState<SettingsTab>('timer');
  const { resetAllSettings } = useSettings();

  if (!isOpen) return null;

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'music', label: 'Music', icon: Music },
  ] as const;

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetAllSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-black/50 rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Fixed Header with Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                currentTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Settings currentTab={currentTab} />
        </div>

        {/* Fixed Footer */}
        <div className="px-4 py-3 border-t border-white/10 text-center">
          <button
            onClick={handleResetAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Reset All Settings to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup; 