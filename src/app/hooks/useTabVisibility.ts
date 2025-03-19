'use client';

import { usePage } from '../contexts/PageContext';

/**
 * Hook to determine if a component should be rendered based on tab visibility
 * Helps with creating persistent components that maintain state across tab changes
 * 
 * @param tabId - The tab ID this component belongs to
 * @returns Object with isVisible and activeTab properties
 */
const useTabVisibility = (tabId: 'mood' | 'timer' | 'chat' | 'meditation') => {
  const { activeTab } = usePage();
  
  return {
    isVisible: activeTab === tabId,
    activeTab
  };
};

export default useTabVisibility; 