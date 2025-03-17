'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Define types for the context
interface PageContextType {
  // Tab navigation state
  activeTab: 'mood' | 'timer' | 'chat' | 'meditation';
  setActiveTab: (tab: 'mood' | 'timer' | 'chat' | 'meditation') => void;
  
  // Settings popup state
  showSettings: boolean;
  initialSettingsTab: 'timer' | 'background' | 'music' | 'analytics' | 'achievements' | 'mood' | 'chatbot' | 'meditation';
  openSettings: (tab?: 'timer' | 'background' | 'music' | 'analytics' | 'achievements' | 'mood' | 'chatbot' | 'meditation') => void;
  closeSettings: () => void;
  
  // Intro animation state
  showIntro: boolean;
  introReady: boolean;
  handleIntroComplete: () => void;
  
  // Screen size warning
  showWarning: boolean;
}

// Create the context
const PageContext = createContext<PageContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and makes page state available to any child component
 */
export function PageProvider({ children }: { children: React.ReactNode }) {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'mood' | 'timer' | 'chat' | 'meditation'>('mood');
  
  // Settings popup state
  const [showSettings, setShowSettings] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<'timer' | 'background' | 'music' | 'analytics' | 'achievements' | 'mood' | 'chatbot' | 'meditation'>('timer');
  
  // Intro animation state
  const [showIntro, setShowIntro] = useState(true);
  const [introReady, setIntroReady] = useState(false);
  
  // Screen size warning
  const [showWarning, setShowWarning] = useState(false);

  // Check screen size and intro animation on mount
  useEffect(() => {
    const checkScreenSize = () => {
      setShowWarning(window.innerWidth < 300);
    };

    // Check if intro has been shown in this session
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    } else {
      // Set intro as ready after a small delay to ensure smooth loading
      setTimeout(() => {
        setIntroReady(true);
      }, 100);
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Set up event listeners for custom events
  useEffect(() => {
    // Listen for custom event to open settings to a specific tab
    const handleOpenSettingsTab = (event: CustomEvent) => {
      if (event.detail && event.detail.tab) {
        setInitialSettingsTab(event.detail.tab);
      }
      setShowSettings(true);
    };

    // Listen for custom event to open auth modal
    const handleOpenAuthModal = () => {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
    };

    window.addEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    window.addEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    
    return () => {
      window.removeEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
      window.removeEventListener("openAuthModal", handleOpenAuthModal as EventListener);
    };
  }, []);

  // Handle intro animation completion
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  }, []);

  // Open settings with optional tab parameter
  const openSettings = useCallback((tab?: 'timer' | 'background' | 'music' | 'analytics' | 'achievements' | 'mood' | 'chatbot' | 'meditation') => {
    if (tab) {
      setInitialSettingsTab(tab);
    } else {
      // Map the active tab to the corresponding settings tab
      let settingsTab: 'mood' | 'timer' | 'chatbot' | 'background' | 'music' | 'analytics' | 'achievements' | 'meditation';
      
      switch (activeTab) {
        case 'mood':
          settingsTab = 'mood';
          break;
        case 'timer':
          settingsTab = 'timer';
          break;
        case 'chat':
          settingsTab = 'chatbot';
          break;
        case 'meditation':
          settingsTab = 'meditation';
          break;
        default:
          settingsTab = 'timer';
      }
      
      setInitialSettingsTab(settingsTab);
    }
    
    setShowSettings(true);
  }, [activeTab]);

  // Close settings and dispatch event
  const closeSettings = useCallback(() => {
    setShowSettings(false);
    window.dispatchEvent(new Event('settingsPopupClosed'));
  }, []);

  // Provide the context value
  const contextValue: PageContextType = {
    activeTab,
    setActiveTab,
    showSettings,
    initialSettingsTab,
    openSettings,
    closeSettings,
    showIntro,
    introReady,
    handleIntroComplete,
    showWarning
  };

  return (
    <PageContext.Provider value={contextValue}>
      {children}
    </PageContext.Provider>
  );
}

/**
 * Hook to use the page context
 */
export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
} 