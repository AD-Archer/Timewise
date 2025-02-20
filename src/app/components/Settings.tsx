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
    <div className="fixed top-2 right-2 md:top-6 md:right-6 z-20">
      <div className="backdrop-blur-md bg-black/50 p-4 md:p-6 rounded-xl shadow-xl w-[280px] md:w-72">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">Settings</h3>

        <div className="space-y-3 md:space-y-4">
          {/* Pomodoro Input */}
          <div>
            <label className="text-white/80 text-xs md:text-sm block mb-1">Pomodoro (min)</label>
            <input 
              type="number" 
              value={pomodoro === 0 ? '' : pomodoro}
              onChange={handleChange(setPomodoro)} 
              className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Short Break Input */}
          <div>
            <label className="text-white/80 text-xs md:text-sm block mb-1">Short Break (min)</label>
            <input 
              type="number" 
              value={shortBreak === 0 ? '' : shortBreak}
              onChange={handleChange(setShortBreak)} 
              className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Long Break Input */}
          <div>
            <label className="text-white/80 text-xs md:text-sm block mb-1">Long Break (min)</label>
            <input 
              type="number" 
              value={longBreak === 0 ? '' : longBreak}
              onChange={handleChange(setLongBreak)} 
              className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button 
            onClick={applySettings} 
            className="w-full py-1.5 md:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-300 mt-4 md:mt-6 text-sm md:text-base"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
