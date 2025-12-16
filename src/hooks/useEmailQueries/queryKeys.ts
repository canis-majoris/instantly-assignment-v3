/**
 * Email Query Keys - Centralized query key management for TanStack Query
 * Provides type-safe, consistent query keys for caching and invalidation
 */

import { EmailFilter } from '@/types';

export interface EmailQueryParams {
  query?: string;
  filter?: EmailFilter;
  threaded?: boolean;
}

/**
 * Query key factory for email-related queries
 * Uses a hierarchical structure for granular cache invalidation
 */
export const emailKeys = {
  // Base key for all email queries
  all: ['emails'] as const,

  // List queries with optional filters
  lists: () => [...emailKeys.all, 'list'] as const,
  list: (params: EmailQueryParams) => [...emailKeys.lists(), params] as const,

  // Individual email queries
  details: () => [...emailKeys.all, 'detail'] as const,
  detail: (id: number) => [...emailKeys.details(), id] as const,

  // Thread queries (all emails in a thread)
  threads: () => [...emailKeys.all, 'thread'] as const,
  thread: (threadId: string) => [...emailKeys.threads(), threadId] as const,

  // Global stats query (independent of filters)
  stats: () => [...emailKeys.all, 'stats'] as const,
};

export default emailKeys;
