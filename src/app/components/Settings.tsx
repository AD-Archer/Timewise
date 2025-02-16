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
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-4 rounded z-10 max-w-xs sm:max-w-md">
      <h3 className="text-white mb-2 text-lg sm:text-xl">Settings</h3>

      <label className="text-white">Pomodoro (min):</label>
      <input 
        type="number" 
        value={pomodoro === 0 ? '' : pomodoro}  // Show empty string if value is 0
        onChange={handleChange(setPomodoro)} 
        className="block p-2 mb-2 bg-gray-700 text-white rounded w-full"
      />

      <label className="text-white">Short Break (min):</label>
      <input 
        type="number" 
        value={shortBreak === 0 ? '' : shortBreak}  // Show empty string if value is 0
        onChange={handleChange(setShortBreak)} 
        className="block p-2 mb-2 bg-gray-700 text-white rounded w-full"
      />

      <label className="text-white">Long Break (min):</label>
      <input 
        type="number" 
        value={longBreak === 0 ? '' : longBreak}  // Show empty string if value is 0
        onChange={handleChange(setLongBreak)} 
        className="block p-2 mb-2 bg-gray-700 text-white rounded w-full"
      />

      <button 
        onClick={applySettings} 
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 w-full sm:w-auto"
      >
        Apply
      </button>
    </div>
  );
};

export default Settings;
