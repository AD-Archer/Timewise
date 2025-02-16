'use client'

import React, { useState, useEffect } from 'react';

const BackgroundSelector: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [currentBg, setCurrentBg] = useState<string | null>(null);

  useEffect(() => {
    const imageList = [
      '/images/pinkroshihouse.webp',
      '/images/pinkcatwindow.webp',
      '/images/night.webp',
      '/images/bluekit.webp',
    ];
    setBackgrounds(imageList);
    setCurrentBg(imageList[0]);
  }, []);

  const changeBackground = (newBg: string) => {
    setCurrentBg(newBg);
  };

  return (
    <>
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-500 -z-50"
        style={{ backgroundImage: `url(${currentBg})` }}
      />

      {/* Buttons for Background Selection */}
      <div className="absolute top-4 left-4 flex space-x-2 p-2 bg-black bg-opacity-50 rounded z-10">
        {backgrounds.map((bg, index) => (
          <button 
            key={index} 
            onClick={() => changeBackground(bg)}
            className="p-2 text-white bg-gray-700 hover:bg-gray-500 rounded"
          >
            Bg {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default BackgroundSelector;
