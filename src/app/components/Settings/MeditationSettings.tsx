'use client';

import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Slider } from '../../components/ui/Slider';
import { Switch } from '../../components/ui/Switch';

const MeditationSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  // Update sound settings
  const handleSoundEnabledChange = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
  };

  const handleVolumeChange = (value: number) => {
    updateSettings({ soundVolume: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Meditation Settings</h3>
        
        <div className="space-y-4">
          {/* Sound Settings */}
          <div className="bg-black/20 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3">Sound Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="sound-enabled" className="text-sm text-gray-300">
                  Enable Meditation Sounds
                </label>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={handleSoundEnabledChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="sound-volume" className="text-sm text-gray-300">
                    Sound Volume
                  </label>
                  <span className="text-sm text-gray-400">{settings.soundVolume}%</span>
                </div>
                <Slider
                  id="sound-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={settings.soundVolume}
                  onChange={handleVolumeChange}
                  disabled={!settings.soundEnabled}
                />
              </div>
            </div>
          </div>
          
          {/* Information */}
          <div className="bg-black/20 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-2">About Meditation</h4>
            <p className="text-sm text-gray-300">
              Regular meditation can help reduce stress, improve focus, and promote overall well-being. 
              Choose from different meditation types to suit your needs and preferences.
            </p>
            <div className="mt-3 text-sm text-gray-400">
              <p>• Breath Focus: Simple meditation focusing on your breath</p>
              <p>• Body Scan: Progressive relaxation from head to toe</p>
              <p>• Mindful Awareness: Being present without judgment</p>
              <p>• Loving-Kindness: Cultivating feelings of goodwill</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationSettings; 