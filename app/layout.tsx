import React from 'react';
import type { Metadata } from 'next';
import classNames from 'classnames';
import { Geist, Geist_Mono } from 'next/font/google';
import AppProviders from '../components/AppProviders';
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script';
export const metadata: Metadata = {
  title: "WhoAmI",
  description: "Ultimate link in bio and personal brand marketing solution.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
          <body className={classNames(geistSans.variable, geistMono.variable, 'antialiased')}>
            <AppProviders>
              {children}
            </AppProviders>
            <Analytics />
                     <Script
            src="https://zenoassist.com/widget.js"
            data-zenoassist-v2
            data-company-id="41753172-432d-4afe-935c-a6b9b406ac7c"
            data-position="bottom-right"
            strategy="beforeInteractive"
          />
 
          </body>
        </html>
    );
}
