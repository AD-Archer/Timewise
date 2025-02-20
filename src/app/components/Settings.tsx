'use client'
import React, { useState } from 'react';

interface SettingsProps {
  setDurations: (durations: { pomodoro: number; shortBreak: number; longBreak: number }) => void;
}

const Settings: React.FC<SettingsProps> = ({ setDurations }) => {
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(10);

  const applySettings = () => {
    setDurations({ pomodoro: pomodoro * 60, shortBreak: shortBreak * 60, longBreak: longBreak * 60 });
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
          {/* Pomodoro Input */}
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Pomodoro:</label>
            <input 
              type="number" 
              value={pomodoro === 0 ? '' : pomodoro}
              onChange={handleChange(setPomodoro)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {/* Short Break Input */}
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Short Break:</label>
            <input 
              type="number" 
              value={shortBreak === 0 ? '' : shortBreak}
              onChange={handleChange(setShortBreak)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {/* Long Break Input */}
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-xs w-20">Long Break:</label>
            <input 
              type="number" 
              value={longBreak === 0 ? '' : longBreak}
              onChange={handleChange(setLongBreak)} 
              className="flex-1 px-2 py-1 bg-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
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
