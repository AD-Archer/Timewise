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

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-4 rounded z-10">
      <h3 className="text-white mb-2">Settings</h3>

      <label className="text-white">Pomodoro (min):</label>
      <input 
        type="number" 
        value={pomodoro} 
        onChange={(e) => setPomodoro(Number(e.target.value))} 
        className="block p-1 mb-2 bg-gray-700 text-white rounded"
      />

      <label className="text-white">Short Break (min):</label>
      <input 
        type="number" 
        value={shortBreak} 
        onChange={(e) => setShortBreak(Number(e.target.value))} 
        className="block p-1 mb-2 bg-gray-700 text-white rounded"
      />

      <label className="text-white">Long Break (min):</label>
      <input 
        type="number" 
        value={longBreak} 
        onChange={(e) => setLongBreak(Number(e.target.value))} 
        className="block p-1 mb-2 bg-gray-700 text-white rounded"
      />

      <button 
        onClick={applySettings} 
        className="bg-blue-500 text-white px-3 py-1 rounded mt-2 hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
};

export default Settings;
