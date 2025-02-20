'use client'
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [pomodoro, setPomodoro] = useState(Math.floor(settings.durations.pomodoro / 60));
  const [shortBreak, setShortBreak] = useState(Math.floor(settings.durations.shortBreak / 60));
  const [longBreak, setLongBreak] = useState(Math.floor(settings.durations.longBreak / 60));
  const [targetPomodoros, setTargetPomodoros] = useState(settings.targetPomodoros);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);

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

  return (
    <div className="mx-auto max-w-sm">
      <div className="backdrop-blur-md bg-black/50 p-3 rounded-xl shadow-xl">
        <h3 className="text-base font-semibold mb-2 text-white">Settings</h3>

        <div className="space-y-2">
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
      </div>
    </div>
  );
};

export default Settings;
