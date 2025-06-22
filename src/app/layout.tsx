import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "../components/Navigation";
import { headers } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bike Rental Platform",
  description: "Sustainable bike rental platform for educational institutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get('next-url') || '';
  const hideNavOnRoutes = ['/login', '/register'];
  const shouldHideNav = hideNavOnRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {!shouldHideNav && <Navigation />}
          {children}
        </Providers>
      </body>
    </html>
  );
} 