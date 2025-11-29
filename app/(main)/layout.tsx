"use client";
import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import { UserProvider } from "@/lib/contexts/UserContext"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { ensureOnboarded } from "./onboarding-functions";
import { ErrorBoundary } from '../../components/ErrorBoundary';
import ErrorConsole from '../../components/ErrorConsole';
import { TourProvider } from '@/lib/tours/TourProvider';
import { TourTooltip } from '@/components/tours/TourTooltip';
import { HelpButton } from '@/components/tours/HelpButton';
import Header from '@/components/Header';
import ContentWrapper from '@/components/ContentWrapper';
import { useUser } from "@stackframe/stack";
import { usePathname } from 'next/navigation';
import React from 'react';
import { useAuthorization } from "@/lib/hooks/useAuthorization";

keepSessionAlive: true // Set to true to keep user sessions active; set to false if you want sessions to expire automatically

function LayoutContent({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const { isAdmin } = useAuthorization();

  const publicRoutePatterns = [
    /^\/magnet(\/|$)/,
    /^\/f(\/|$)/,
    /^\/p(\/|$)/,
    /^\/book(\/|$)/,
    /^\/$/,
    /^\/c\/[^/]+$/, // course landing pages
  ];

  const isPublicRoute = pathname
    ? publicRoutePatterns.some((pattern) => pattern.test(pathname ?? ""))
    : false;
  
  const showNavigation = !isPublicRoute;

  return (
    <>
      {showNavigation && <Header />}
      <ContentWrapper hasSidebar={showNavigation && !!user}>
        {children}
      </ContentWrapper>
      {showNavigation && isAdmin && <ErrorConsole />}
      {showNavigation && (
        <>
          <TourTooltip />
          <HelpButton />
        </>
      )}
    </>
  );
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  ensureOnboarded();
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <UserProvider>
          <AuthProvider>
            <TourProvider>
              <ErrorBoundary>
                <LayoutContent>
                  {children}
                </LayoutContent>
              </ErrorBoundary>
            </TourProvider>
          </AuthProvider>
        </UserProvider>
      </StackTheme>
    </StackProvider>
  );
}
