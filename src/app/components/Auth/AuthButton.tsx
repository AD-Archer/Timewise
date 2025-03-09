'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';

interface AuthButtonProps {
  onOpenSettings: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ onOpenSettings }) => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
    );
  }

  return (
    <>
      {user ? (
        <UserProfile onOpenSettings={onOpenSettings} />
      ) : (
        <button
          onClick={openAuthModal}
          className="flex items-center gap-2 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
        >
          <LogIn size={16} />
          <span className="hidden sm:inline">Sign In</span>
        </button>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default AuthButton; 