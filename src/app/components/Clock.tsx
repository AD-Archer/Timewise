'use client'

// components/Clock.js
import { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
      {time}
    </div>
  );
};

export default Clock;
