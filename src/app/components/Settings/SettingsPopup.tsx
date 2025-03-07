'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Image, Music, Target, Award, Download, Upload, BarChart } from 'lucide-react'; 
import Settings from './Settings';
import { useSettings } from '../../contexts/SettingsContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'timer' | 'background' | 'music' | 'analytics' | 'achievements';
}

type SettingsTab = 'timer' | 'background' | 'music' | 'analytics' | 'achievements';

const SettingsPopup = ({ isOpen, onClose, initialTab = 'timer' }: SettingsPopupProps) => {
  const [currentTab, setCurrentTab] = useState<SettingsTab>(initialTab);
  const { settings, updateSettings, resetAllSettings } = useSettings();
  const { analytics } = useAnalytics();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update currentTab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'analytics', label: 'Stats', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award }, 
  ] as const;

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      resetAllSettings();
    }
  };

  const handleDownloadData = () => {
    // Create a JSON blob with the settings data
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timewise-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStats = () => {
    // Create a JSON blob with the analytics data
    const dataStr = JSON.stringify(analytics, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timewise-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        
        // Validate the imported settings
        if (!importedSettings || typeof importedSettings !== 'object') {
          throw new Error('Invalid settings format');
        }
        
        // Confirm before importing
        if (confirm('Are you sure you want to import these settings? This will override your current settings.')) {
          updateSettings(importedSettings);
          alert('Settings imported successfully!');
        }
      } catch (error) {
        alert('Error importing settings. Please make sure the file is a valid Timewise settings JSON file.');
        console.error('Import error:', error);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
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

        {/* Fixed Header with Scrollable Tabs */}
        <div className="overflow-x-auto flex-none border-b border-white/10 custom-scrollbar">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors whitespace-nowrap ${
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Settings currentTab={currentTab} />
          
          {/* Stats Download Button - Only show when on analytics tab */}
          {currentTab === 'analytics' && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownloadStats}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 px-3 py-2 rounded-lg"
              >
                <BarChart size={16} />
                <Download size={16} />
                Download Statistics Data
              </button>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex-none px-4 py-3 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={handleResetAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Reset All Settings to Default
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Upload size={14} />
                Import Settings
              </button>
              <button
                onClick={handleDownloadData}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <Download size={14} />
                Download Settings
              </button>
              {/* Hidden file input for importing */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
          <p className="text-sm text-white text-center mt-2">
            Consider contributing to our project on 
            <a 
              href="https://github.com/ad-archer/timewise" 
              className="text-pink-600 hover:text-pink-400 transition-colors"
            >
               : GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
