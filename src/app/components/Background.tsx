'use client'

import { useBackground } from '../contexts/BackgroundContext';

const BackgroundSelector = () => {
  const { backgrounds, currentBackground, setBackground } = useBackground();

  return (
    <div className="fixed bottom-4 left-4 z-30">
      <div className="backdrop-blur-md bg-black/50 p-1.5 rounded-lg shadow-xl">
        <div className="flex gap-1">
          {backgrounds.map((bg, index) => (
            <button 
              key={index} 
              onClick={() => setBackground(bg)}
              className={`p-2 rounded-md transition-all duration-300 text-xs ${
                currentBackground === bg
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
  );
};

export default BackgroundSelector;
