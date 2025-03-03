'use client';

import { useBackground } from '../../contexts/BackgroundContext';

const BackgroundImage = () => {
  const { currentBackground } = useBackground();

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center transition-all duration-1000 -z-10"
      style={{ 
        backgroundImage: `url(${currentBackground})`,
        opacity: 0.6 
      }}
    />
  );
};

export default BackgroundImage; 