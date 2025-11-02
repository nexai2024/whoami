"use client"
import React from 'react';
import Link from 'next/link';
import { ErrorContext, AppError } from './ErrorContext';

class ErrorBoundaryInner extends React.Component<{
  children: React.ReactNode;
  addError: (err: Partial<AppError> | Error, context?: string) => void;
}, { hasError: boolean; error?: Error; info?: React.ErrorInfo }> {
  constructor(props: { children: React.ReactNode; addError: (err: Partial<AppError> | Error, context?: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Attach componentStack to error object for state capture
      const errorWithStack = {
        ...error,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
      
      this.props.addError(
        errorWithStack,
        'boundary: Caught by ErrorBoundary'
      );
    } catch {}
    this.setState({ hasError: true, error, info: errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-4">An unexpected error occurred. Please try again or contact support.</p>
          {this.state.error && (
            <details className="mb-4 text-left max-w-xl mx-auto bg-red-50 border border-red-200 rounded p-4 text-xs text-red-800">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <div><b>Message:</b> {this.state.error.message}</div>
              {this.state.info?.componentStack && (
                <div className="mt-2"><b>Stack:</b> <pre>{this.state.info.componentStack}</pre></div>
              )}
            </details>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Reload Page
            </button>
            <Link href="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper component that consumes the ErrorContext and passes addError to ErrorBoundaryInner
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorContext.Consumer>
      {(value) => (
        <ErrorBoundaryInner addError={value?.addError || (() => {})}>
          {children}
        </ErrorBoundaryInner>
      )}
    </ErrorContext.Consumer>
  );
};

// Usage: <ErrorBoundary><App /></ErrorBoundary>
