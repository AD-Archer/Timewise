'use client';

import React from 'react';
import { Clock, BarChart2, MessageCircle } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'mood' | 'timer' | 'chat';
  onTabChange: (tab: 'mood' | 'timer' | 'chat') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="backdrop-blur-md bg-black/30 rounded-full p-1 flex shadow-lg">
        <button
          onClick={() => onTabChange('mood')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            activeTab === 'mood'
              ? 'bg-pink-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <BarChart2 size={20} />
          <span className="hidden md:inline">Mood Tracker</span>
        </button>
        
        <button
          onClick={() => onTabChange('timer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            activeTab === 'timer'
              ? 'bg-pink-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Clock size={20} />
          <span className="hidden md:inline">Timer</span>
        </button>

        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            activeTab === 'chat'
              ? 'bg-pink-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <MessageCircle size={20} />
          <span className="hidden md:inline">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default TabNavigation; 