'use client';

import { useState, useEffect } from 'react';

interface ContentWrapperProps {
  children: React.ReactNode;
  hasSidebar: boolean;
}

export default function ContentWrapper({ children, hasSidebar }: ContentWrapperProps) {
  // With Option 1 navigation, we don't need sidebar margins
  // Content starts from the left edge, below the fixed top nav
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
