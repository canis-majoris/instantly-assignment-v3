/**
 * App-level providers wrapper
 * Includes nuqs adapter for URL state syncing
 */

'use client';

import { ReactNode } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import ThemeProvider from '@/components/ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider>{children}</ThemeProvider>
    </NuqsAdapter>
  );
}
