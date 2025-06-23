'use client';

import React from 'react';
import { Navigation } from './Navigation';

export function NavigationWrapper() {
  // Always show navigation - the Navigation component handles authentication states internally
  return <Navigation />;
} 