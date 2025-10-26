'use client';

import { useState, useEffect } from 'react';

interface ContentWrapperProps {
  children: React.ReactNode;
  hasSidebar: boolean;
}

export default function ContentWrapper({ children, hasSidebar }: ContentWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!hasSidebar) return;

    // Read initial state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    }

    // Listen for storage changes (when sidebar toggles in different tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sidebarCollapsed' && e.newValue !== null) {
        setCollapsed(JSON.parse(e.newValue));
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleSidebarToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarToggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, [hasSidebar]);

  // Calculate margin class based on sidebar state
  const marginClass = hasSidebar
    ? collapsed
      ? 'lg:ml-16'  // 64px when collapsed
      : 'lg:ml-72'  // 288px when expanded
    : '';

  return (
    <div className={`transition-all duration-300 ease-in-out ${marginClass}`}>
      {children}
    </div>
  );
}
