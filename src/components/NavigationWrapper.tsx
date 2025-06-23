'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Navigation } from './Navigation';

export function NavigationWrapper() {
  const { status } = useSession();

  // Show navigation when user is authenticated or when status is loading
  // This ensures navigation is visible during the loading state and when logged in
  if (status === 'loading' || status === 'authenticated') {
    return <Navigation />;
  }

  // Don't show navigation for unauthenticated users
  return null;
} 