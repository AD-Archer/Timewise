'use client';

import React from 'react';

interface SliderProps {
  id?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  min,
  max,
  step,
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        // Custom styling for the slider track and thumb
        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
          ((value - min) / (max - min)) * 100
        }%, #4b5563 ${((value - min) / (max - min)) * 100}%, #4b5563 100%)`,
      }}
    />
  );
}; 