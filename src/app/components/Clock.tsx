'use client';

import { useState, useEffect } from 'react';

/**
 * Clock component that displays the current local time
 * Updates every second to show accurate time
 */
const Clock = () => {
  // Start with null to prevent hydration mismatch
  const [time, setTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Set initial time on client-side only
    setTime(new Date());
    
    // Update time every second
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // If time is null (during server rendering), show a placeholder
  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-black/30 backdrop-blur-sm rounded-lg text-white shadow-lg">
        <div className="text-3xl font-semibold mb-1">--:--:-- --</div>
        <div className="text-sm opacity-80">Loading...</div>
      </div>
    );
  }
  
  // Format time as HH:MM:SS
  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  // Format date as Day, Month Date, Year
  const formattedDate = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-black/30 backdrop-blur-sm rounded-lg text-white shadow-lg">
      <div className="text-2xl md:text-3xl font-semibold mb-0 md:mb-1">{formattedTime}</div>
      <div className="text-xs md:text-sm opacity-80">{formattedDate}</div>
    </div>
  );
};

export default Clock; 