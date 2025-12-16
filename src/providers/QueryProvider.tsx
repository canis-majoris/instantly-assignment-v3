/**
 * React Query Provider - Configures TanStack Query for the application
 * Provides query client with optimized defaults for the email client
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
  /** Optional QueryClient for testing purposes */
  client?: QueryClient;
}

/**
 * Creates a QueryClient with sensible defaults for the email client
 */
export function makeQueryClient(options?: { staleTime?: number }) {
  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus for better UX
        refetchOnWindowFocus: false,
        // Retry failed requests once (disable in tests)
        retry: isTest ? false : 1,
        // Cache data for 5 minutes (0 in tests for immediate refetch)
        staleTime: options?.staleTime ?? (isTest ? 0 : 5 * 60 * 1000),
        // Disable garbage collection time in tests
        gcTime: isTest ? 0 : undefined,
      },
      mutations: {
        // Retry mutations once on failure (disable in tests)
        retry: isTest ? false : 1,
      },
    },
  });
}

// Browser-side query client (singleton)
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  }

  // Browser: reuse the same query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Resets the browser query client singleton (for testing)
 */
export function resetQueryClient() {
  browserQueryClient = undefined;
}

/**
 * Query Provider component that wraps the app with TanStack Query
 * Accepts an optional client prop for testing purposes
 */
export function QueryProvider({ children, client }: QueryProviderProps) {
  const [defaultClient] = useState(() => getQueryClient());
  const queryClient = client ?? defaultClient;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
