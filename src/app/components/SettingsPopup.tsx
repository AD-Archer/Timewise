'use client';

import React from 'react';
import { X } from 'lucide-react';
import Settings from './Settings';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup = ({ isOpen, onClose }: SettingsPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
        >
          <X size={20} />
        </button>
        <Settings />
      </div>
    </div>
  );
};

export default SettingsPopup; 