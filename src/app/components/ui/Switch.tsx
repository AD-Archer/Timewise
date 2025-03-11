'use client';

import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.target.checked);
  };

  return (
    <label
      htmlFor={id}
      className={`relative inline-flex items-center cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
        ${checked ? 'after:translate-x-full after:border-white bg-pink-600' : 'after:translate-x-0 after:border-gray-300'} 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
      ></div>
    </label>
  );
}; 