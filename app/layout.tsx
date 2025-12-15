import React from 'react';
import type { Metadata } from 'next';
import classNames from 'classnames';
import { Geist, Geist_Mono } from 'next/font/google';
import AppProviders from '../components/AppProviders';
import { Analytics } from "@vercel/analytics/next"

import {CheckoutProvider} from '@stripe/react-stripe-js/checkout';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51MuRTZGYUVTOcGG4f5tDLRuI5nU4ZmMH6nptEp0SPAo8uvdIboF2VD3jHG6SvggscCflgxc7DoNcVKvDUpAwQUCv00lXNLHYZJ');

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
          </body>
        </html>
    );
}