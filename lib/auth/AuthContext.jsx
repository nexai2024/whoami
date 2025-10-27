"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { userAgent } from 'next/server';
import { useUser } from "@stackframe/stack"
//import { sub } from 'framer-motion/dist/m';
import { onboardingComplete, initOnboardingUser } from '@/app/(main)/onboarding-functions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currUser, setCurrUser] = useState();
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const isSignedIn = !!user;

  useEffect(() => {
    function checkAuthStatus() {
      try {
        console.log("Auth check - user:", user, "isSignedIn:", isSignedIn);

        if (user && isSignedIn) {
          setIsAuthenticated(true);
          setCurrUser(user);
        } else {
          setIsAuthenticated(false);
          setCurrUser(null);
        }
      } catch (error) {
        logger.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setCurrUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, [user, isSignedIn]);

  useEffect(() => {
    async function initUser() {
      if (user && isSignedIn) 
      setCurrUser(user);
      setIsAuthenticated(true);
      console.log("Initializing user metadata if absent");
      try {
        if (!user.clientReadOnlyMetadata) {
          await initOnboardingUser();
          console.log("User metadata initialized");
        }
      } catch (error) {
        logger.error('Error initializing user metadata:', error);
      }
    }
    initUser();
}, [user, isSignedIn]);

// Log currUser whenever it changes
useEffect(() => {
  console.log("Current User - Init User", currUser);
}, [currUser]);

const checkUserExists = async () => {
  const user = await fetch('/api/testing/user?userId=' + user.id);
  if (user.ok) {
    return true;
  } else {
    return false;
  }
};

const logout = () => {

  if (user && typeof user.signOut === 'function') {
    user.signOut();
  }
  setIsAuthenticated(false);
  setCurrUser(null);

  logger.info('User logged out successfully');
};

const completeOnboarding = () => {
  localStorage.setItem('onboardingComplete', 'true');
  setCurrUser(prev => ({
    ...prev,
    onboardingComplete: true
  }));

  logger.info('Onboarding completed');
};

const value = {
  isAuthenticated,
  currUser,
  loading,
  logout,
  completeOnboarding
};

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
};