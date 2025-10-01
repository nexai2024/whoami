"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppError = {
  id: string;
  message: string;
  stack?: string;
  context?: string;
  time: Date;
};

type ErrorContextType = {
  errors: AppError[];
  addError: (err: Partial<AppError> | Error, context?: string) => void;
  clearErrors: () => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useErrorContext must be used within ErrorProvider');
  return ctx;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (err: Partial<AppError> | Error, context?: string) => {
    const errorObj: AppError = {
      id: `${Date.now()}-${Math.random()}`,
      message: err instanceof Error ? err.message : err.message || 'Unknown error',
      stack: err instanceof Error ? err.stack : err.stack,
      context: context || (('context' in err && typeof err.context === 'string') ? err.context : undefined),
      time: new Date(),
    };
    setErrors((prev) => [errorObj, ...prev]);
    // Optionally: send to backend or external logger here
    if (typeof window !== 'undefined') console.error('[AppError]', errorObj);
  };

  const clearErrors = () => setErrors([]);

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};
