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
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 -z-50"
        style={{ 
          backgroundImage: `url(${currentBg})`,
          opacity: 0.6 
        }}
      />

      {/* Background Selector Controls */}
      <div className="fixed bottom-2 left-2 md:bottom-6 md:left-6 z-20">
        <div className="backdrop-blur-md bg-black/50 p-2 md:p-3 rounded-xl shadow-xl">
          <div className="flex gap-1 md:gap-2">
            {backgrounds.map((bg, index) => (
              <button 
                key={index} 
                onClick={() => changeBackground(bg)}
                className={`p-2 md:p-3 rounded-lg transition-all duration-300 text-sm md:text-base ${
                  currentBg === bg
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundSelector;
