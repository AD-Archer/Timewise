'use client'
import React, { useState, useEffect } from 'react';
import { Pause, Play, RefreshCw, Clock } from 'lucide-react';

interface CountdownTimerProps {
  initialDays?: number;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialDays = 0,
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0
}) => {
  const [days, setDays] = useState(initialDays);
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else if (hours > 0) {
          setHours(prev => prev - 1);
          setMinutes(59);
          setSeconds(59);
        } else if (days > 0) {
          setDays(prev => prev - 1);
          setHours(23);
          setMinutes(59);
          setSeconds(59);
        } else {
          setIsRunning(false);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [days, hours, minutes, seconds, isRunning]);

  const resetTimer = () => {
    setDays(initialDays);
    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="bg-blue-900 text-blue-100 shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center mb-6">
        <Clock className="w-12 h-12 text-blue-300 mb-2" />
        <h2 className="text-xl font-semibold text-blue-200">Countdown Timer</h2>
      </div>

      <div className="flex justify-center items-center space-x-4 mb-4">
        {[
          { label: 'Days', value: days, setter: setDays, max: undefined },
          { label: 'Hours', value: hours, setter: setHours, max: 23 },
          { label: 'Minutes', value: minutes, setter: setMinutes, max: 59 },
          { label: 'Seconds', value: seconds, setter: setSeconds, max: 59 }
        ].map(({ label, value, setter, max }) => (
          <div key={label} className="flex flex-col items-center">
            <input 
              type="number" 
              min="0" 
              max={max} 
              value={value === 0 ? '' : value} 
              onChange={(e) => {
                const inputValue = e.target.value === '' ? 0 : Number(e.target.value);
                setter(inputValue);
              }} 
              placeholder="0"
              className="w-16 text-center bg-blue-800 text-blue-100 border-blue-700 border rounded p-1 
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         appearance-none"
            />
            <span className="text-blue-300 mt-1">{label}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center space-x-4 mb-4">
        <button 
          onClick={toggleTimer} 
          className={`p-2 rounded-full ${isRunning ? 'bg-yellow-600' : 'bg-green-600'} text-white hover:opacity-80 transition-opacity`}
        >
          {isRunning ? <Pause /> : <Play />}
        </button>
        <button 
          onClick={resetTimer} 
          className="p-2 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
        >
          <RefreshCw />
        </button>
      </div>
      
      <div className="mt-4 text-center text-2xl font-bold text-blue-200 bg-blue-800 py-3 rounded">
        {days}d:{hours.toString().padStart(2, '0')}h: 
        {minutes.toString().padStart(2, '0')}m: 
        {seconds.toString().padStart(2, '0')}s
      </div>
    </div>
  );
};

export default CountdownTimer;