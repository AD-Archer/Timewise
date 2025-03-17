'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePage } from '../../contexts/PageContext';
import { LogIn } from 'lucide-react';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';

/**
 * Authentication button that shows sign-in or user profile
 */
const AuthButton: React.FC = () => {
  const { user, loading } = useAuth();
  const { openSettings } = usePage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    
    return () => {
      window.removeEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    };
  }, []);

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
        <UserProfile onOpenSettings={openSettings} />
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