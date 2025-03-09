'use client';

import { useState, useEffect } from 'react';

interface TimeDisplayProps {
  size?: 'small' | 'medium' | 'large';
  showSeconds?: boolean;
  showDate?: boolean;
  className?: string;
}

/**
 * TimeDisplay component that displays the current local time
 * Updates every second to show accurate time
 */
const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  size = 'medium', 
  showSeconds = true, 
  showDate = true,
  className = ''
}) => {
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
      <div className={`flex flex-col items-center justify-center p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white shadow-lg ${className}`}>
        <div className="text-xl font-semibold">--:--</div>
      </div>
    );
  }
  
  // Format time as HH:MM or HH:MM:SS based on showSeconds prop
  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true
  });
  
  // Format date as Day, Month Date, Year
  const formattedDate = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  // Determine size classes
  const sizeClasses = {
    small: 'p-1 text-sm',
    medium: 'p-2 text-base',
    large: 'p-3 text-xl md:text-2xl'
  };
  
  const containerClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div className={`flex flex-col items-center justify-center ${containerClass} bg-black/30 backdrop-blur-sm rounded-lg text-white shadow-lg ${className}`}>
      <div className="font-semibold">{formattedTime}</div>
      {showDate && <div className="text-xs opacity-80 mt-0.5">{formattedDate}</div>}
    </div>
  );
};

export default TimeDisplay; 