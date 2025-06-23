import React from 'react';
import { NavigationWrapper } from '@/components/NavigationWrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationWrapper />
      {children}
    </>
  );
} 