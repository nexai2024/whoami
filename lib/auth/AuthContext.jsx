"use client"
import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

/**
 * AuthContext - Backward compatibility wrapper around UserContext
 * @deprecated Use UserContext directly via useUserContext hook
 * This is kept for backward compatibility with existing code
 * 
 * IMPORTANT: This provider must be used INSIDE UserProvider
 */
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const userContext = useContext(UserContext);
  
  if (!userContext) {
    throw new Error('AuthProvider must be used inside UserProvider');
  }
  
  const value = {
    isAuthenticated: userContext.isAuthenticated,
    currUser: userContext.user,
    loading: userContext.loading,
    logout: userContext.logout,
    completeOnboarding: userContext.completeOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
