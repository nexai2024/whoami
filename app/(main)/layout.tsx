"use client";
import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import { AuthProvider } from "@/lib/auth/AuthContext"
import { Suspense } from 'react';
import { ensureOnboarded } from "./onboarding-functions";
import { ErrorProvider } from '../../components/ErrorContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import ErrorConsole from '../../components/ErrorConsole';
import { TourProvider } from '@/lib/tours/TourProvider';
import { TourTooltip } from '@/components/tours/TourTooltip';
import { HelpButton } from '@/components/tours/HelpButton';
import Header from '@/components/Header';

keepSessionAlive: true // Set to true to keep user sessions active; set to false if you want sessions to expire automatically

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  ensureOnboarded();
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <AuthProvider>
          <ErrorProvider>
            <TourProvider>
              <ErrorBoundary>
                <Header />
                {children}
                <ErrorConsole />
                <TourTooltip />
                <HelpButton />
              </ErrorBoundary>
            </TourProvider>
          </ErrorProvider>
        </AuthProvider>
      </StackTheme>
    </StackProvider>
  );
}
