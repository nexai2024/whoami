"use client";
import React from 'react';
import { useUser } from "@stackframe/stack";
import Sidebar from './Sidebar';
import UnauthenticatedHeader from './UnauthenticatedHeader';

const Header = () => {
  const user = useUser();

  // Show sidebar for authenticated users, unauthenticated header for others
  if (user) {
    return <Sidebar />;
  }

  return <UnauthenticatedHeader />;
};

export default Header;