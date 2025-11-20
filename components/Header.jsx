"use client";
import React from 'react';
import { useUser } from "@stackframe/stack";
import CommandPaletteNav from './CommandPaletteNav';
import UnauthenticatedHeader from './UnauthenticatedHeader';

const Header = () => {
  const user = useUser();

  // Show command palette nav for authenticated users, unauthenticated header for others
  if (user) {
    return <CommandPaletteNav />;
  }

  return <UnauthenticatedHeader />;
};

export default Header;