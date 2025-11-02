"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppError = {
  id: string;
  message: string;
  stack?: string;
  context?: string;
  time: Date;
  
  // New fields for state capture
  url?: string;
  pathname?: string;
  userAgent?: string;
  componentStack?: string;
  errorType?: 'runtime' | 'boundary' | 'api' | 'validation';
  
  // For historical errors from database
  userId?: string;
  userEmail?: string;
  userPlan?: string;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
};

type ErrorContextType = {
  errors: AppError[];
  addError: (err: Partial<AppError> | Error, context?: string) => void;
  clearErrors: () => void;
};

export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useErrorContext must be used within ErrorProvider');
  return ctx;
};

// Maximum number of errors to keep in state (prevent memory issues)
const MAX_ERRORS = 50;

// Helper function to determine error type
const determineErrorType = (err: any, context?: string): AppError['errorType'] => {
  if (context?.includes('boundary')) return 'boundary';
  if (context?.includes('api') || err.message?.includes('fetch')) return 'api';
  if (context?.includes('validation')) return 'validation';
  return 'runtime';
};

// Async function to persist error to database
const persistError = async (error: AppError) => {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        errorType: error.errorType,
        url: error.url,
        pathname: error.pathname,
        userAgent: error.userAgent,
        componentStack: error.componentStack,
        context: error.context,
      }),
    });
  } catch (err) {
    // Silently fail - don't create error loop
    console.error('Failed to persist error:', err);
  }
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (err: Partial<AppError> | Error, context?: string) => {
    // Capture current app state
    const url = typeof window !== 'undefined' ? window.location.href : undefined;
    const pathname = typeof window !== 'undefined' ? window.location.pathname : undefined;
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
    
    const errorObj: AppError = {
      id: `${Date.now()}-${Math.random()}`,
      message: err instanceof Error ? err.message : err.message || 'Unknown error',
      stack: err instanceof Error ? err.stack : err.stack,
      context: context || (('context' in err && typeof err.context === 'string') ? err.context : undefined),
      time: new Date(),
      
      // Capture state
      url,
      pathname,
      userAgent,
      componentStack: err instanceof Error && 'componentStack' in err ? (err as any).componentStack : undefined,
      errorType: determineErrorType(err, context),
    };
    
    setErrors((prev) => {
      // Add new error and limit to MAX_ERRORS
      const updated = [errorObj, ...prev];
      return updated.slice(0, MAX_ERRORS);
    });
    
    if (typeof window !== 'undefined') console.error('[AppError]', errorObj);
    
    // Persist to database (async, don't await to avoid blocking UI)
    persistError(errorObj).catch(console.error);
  };

  const clearErrors = () => setErrors([]);

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};
