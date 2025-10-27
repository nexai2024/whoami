import React from 'react';
import { Navigate } from 'next/navigation';
import { QuestAuthService } from '../../lib/auth/questAuth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = QuestAuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/handler/sign-in" replace />;
  }
  
  return children;
};

export default ProtectedRoute;