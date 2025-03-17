'use client';

import React from 'react';
import { Clock, BarChart2, MessageCircle, Flower } from 'lucide-react';
import { usePage } from '../contexts/PageContext';

/**
 * Navigation tabs for switching between app features
 */
const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = usePage();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="backdrop-blur-md bg-black/30 rounded-full p-1 flex shadow-lg">
        <button
          onClick={() => setActiveTab('mood')}
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
          onClick={() => setActiveTab('timer')}
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
          onClick={() => setActiveTab('meditation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            activeTab === 'meditation'
              ? 'bg-pink-600 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Flower size={20} />
          <span className="hidden md:inline">Meditation</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
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