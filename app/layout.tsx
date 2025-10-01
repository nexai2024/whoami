import React from 'react';
import type { Metadata } from 'next';
import classNames from 'classnames';
import { Geist, Geist_Mono } from 'next/font/google';


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
        <html lang="en">
            <head />
          <body className={classNames(geistSans.variable, geistMono.variable, 'antialiased')}>
            
                {children}
               
        

          </body>
        </html>
    );
}