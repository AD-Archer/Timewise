'use client'
import React, { useState, useEffect } from 'react';
import { Pause, Play, RefreshCw, Clock } from 'lucide-react'; // a svg icon pack for react

interface CountdownTimerProps { // here i define the props and what types they can be
  initialDays?: number; // the ? means optional and the number tells me that if there is an imput it has to be a number 
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ // this "react.fc" delcares a functional react componet. "CountdownTimerProps" specifies that this compnent accepts the props from my interface above
  initialDays = 0,
  initialHours = 0,
  initialMinutes = 25,
  initialSeconds = 0
}) => {
  const [days, setDays] = useState(initialDays);
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout; // Declare a variable to hold the timer's ID.  This is like naming the alarm so you can turn it off.
  
    if (isRunning) { // Only start the timer if it's supposed to be running.
      interval = setInterval(() => { // Set up the timer to tick every 1000ms (1 second).  This is like setting the alarm to go off repeatedly.
        if (seconds > 0) { // If there are still seconds left...
          setSeconds(prev => prev - 1); // ...decrement the seconds.
        } else if (minutes > 0) { // Otherwise, if there are minutes left...
          setMinutes(prev => prev - 1); // ...decrement the minutes...
          setSeconds(59); // ...and reset the seconds to 59.
        } else if (hours > 0) { // And so on for hours and days.
          setHours(prev => prev - 1);
          setMinutes(59);
          setSeconds(59);
        } else if (days > 0) {
          setDays(prev => prev - 1);
          setHours(23);
          setMinutes(59);
          setSeconds(59);
        } else { // If everything is zero, the countdown is finished.
          setIsRunning(false); // Stop the timer.
        }
      }, 1000); // 1000 milliseconds = 1 second
      console.log(`days:${days} Hours:${hours} Mintues:${minutes} Seconds:${seconds}`);

    }
  
    return () => clearInterval(interval); // This is crucial!  This cleanup function runs when the component unmounts or the dependencies of the useEffect change.  It clears the interval to prevent memory leaks and unexpected behavior.  This is like making sure the alarm is definitely turned off when you leave the room or change the alarm settings.
  }, [days, hours, minutes, seconds, isRunning]); // The useEffect runs whenever these values change.

  const resetTimer = () => { // obviously resets the timer
    setDays(initialDays);
    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setIsRunning(false);
  };

  const toggleTimer = () => { // obviously toggles the timer 
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
          { label: 'Days', value: days, setter: setDays, max: undefined }, //these take in the value of the boxes on the site
          { label: 'Hours', value: hours, setter: setHours, max: undefined }, // i want to make hours undefined cause sometimes someone may say 76 hours instead of days and hours yk
          { label: 'Minutes', value: minutes, setter: setMinutes, max: 59 }, // setter declares the set from reacts usestate
          { label: 'Seconds', value: seconds, setter: setSeconds, max: 59 }
        ].map(({ label, value, setter, max }) => (
          <div key={label} className="flex flex-col items-center">
            <input 
              type="number" 
              min="0" 
              max={max} 
              value={value === 0 ? '' : value} 
              onChange={(e) => {
                const inputValue = e.target.value === '' ? 0 : Number(e.target.value); // demetri when the user types in the input it replaces the value with '' unless there is a number other than 0 
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
          {isRunning ? <Pause /> : <Play />} {/* renders the pause button or play button depending or if the timer is paused or played */}
        </button>
        <button 
          onClick={resetTimer} 
          className="p-2 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
        >
          <RefreshCw /> {/*refreshes the icon  */}
        </button>
      </div>
      
      <div className="mt-4 text-center text-2xl font-bold text-blue-200 bg-blue-800 py-3 rounded">
        {days}d:{hours.toString().padStart(2, '0')}h:{/* pad start makes sure the string alwasy show 2 numbers, and the 0 makes it add 0 to the start */}
        {minutes.toString().padStart(2, '0')}m: 
        {seconds.toString().padStart(2, '0')}s
      </div>
    </div>
  );
};

export default CountdownTimer;