'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import Image from 'next/image';

interface UserProfileProps {
  onOpenSettings: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onOpenSettings }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
        aria-label="User menu"
      >
        {user.photoURL ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-500">
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User'}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white">
            <User size={16} />
          </div>
        )}
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500">
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={() => {
                onOpenSettings();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
              Settings
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut size={16} className="text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 