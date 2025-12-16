/**
 * useEmailsQuery - TanStack Query hook for fetching emails
 * Provides automatic caching, background refetching, and loading states
 */

import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { Email, SearchEmailsRequest } from '@/types';
import { emailService } from '@/services';
import { emailKeys } from './queryKeys';

interface UseEmailsQueryOptions {
  /** Search query string */
  query?: string;
  /** Email filter (inbox, important, sent) */
  filter?: SearchEmailsRequest['filter'];
  /** Whether to group by thread */
  threaded?: boolean;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Initial data from server (matches initial URL params) */
  initialData?: Email[];
}

/**
 * Hook for fetching emails with TanStack Query
 *
 * @example
 * const { data: emails, isLoading, error } = useEmailsQuery({
 *   filter: 'inbox',
 *   threaded: true,
 * });
 */
export function useEmailsQuery(options: UseEmailsQueryOptions = {}) {
  const { query, filter, threaded, enabled = true, initialData } = options;

  // Track the initial query params to know when initialData is valid
  // initialData only matches the first render's params (from URL)
  const initialParamsRef = useRef({ query, filter, threaded });
  const isInitialQuery =
    query === initialParamsRef.current.query &&
    filter === initialParamsRef.current.filter &&
    threaded === initialParamsRef.current.threaded;

  const params: SearchEmailsRequest = {
    query: query || undefined,
    filter,
    threaded,
  };

  return useQuery({
    queryKey: emailKeys.list({ query, filter, threaded }),
    queryFn: async () => {
      const response = await emailService.fetchEmails(params);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch emails');
      }

      return response.data ?? [];
    },
    enabled,
    // Only use initialData when query params match the initial URL params
    initialData: isInitialQuery ? initialData : undefined,
  });
}

export default useEmailsQuery;
