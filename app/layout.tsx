import React from 'react';
import type { Metadata } from 'next';
import classNames from 'classnames';
import { Geist, Geist_Mono } from 'next/font/google';
import AppProviders from '../components/AppProviders';
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script';
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
            <Script id="anychat-script" strategy="beforeInteractive">
            {`
              (function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://api.anychat.one/widget2/load?id=a821498e-fbfc-304d-b067-32a9693aab95&r=' + encodeURIComponent(window.location);
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'anw2-sdk-jkkhqPz7TTCwZzKpaTqrlQ'));
            `}
          </Script>
          <Script
            src="https://zenoassist.com/widget.js"
            data-zenoassist-v2
            data-company-id="41753172-432d-4afe-935c-a6b9b406ac7c"
            data-position="bottom-right"
            strategy="lazyOnload"
          />
          </body>
 
        </html>
    );
}