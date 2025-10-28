"use client";
import type { Metadata } from "next";
import '../(main)/globals.css';
import { Suspense } from 'react';

import { ErrorProvider } from '../../components/ErrorContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import ErrorConsole from '../../components/ErrorConsole';

import { HelmetProvider } from "react-helmet-async";

keepSessionAlive: true // Set to true to keep user sessions active; set to false if you want sessions to expire automatically

export default function BioPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
}
