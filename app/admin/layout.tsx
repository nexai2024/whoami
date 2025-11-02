"use client";
import type { Metadata } from "next";
import '../(main)/globals.css';
import { Suspense } from 'react';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import ErrorConsole from '../../components/ErrorConsole';

import { HelmetProvider } from "react-helmet-async";

keepSessionAlive: true // Set to true to keep user sessions active; set to false if you want sessions to expire automatically

export default function AdminPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <HelmetProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </HelmetProvider>
  );
}
