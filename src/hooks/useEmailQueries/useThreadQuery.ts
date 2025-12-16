/**
 * useThreadQuery - TanStack Query hook for fetching all emails in a thread
 */

import { useQuery } from '@tanstack/react-query';
import { Email, EmailFilter } from '@/types';
import { emailService } from '@/services';
import { emailKeys } from './queryKeys';

interface UseThreadQueryOptions {
  /** Thread ID to fetch */
  threadId: string | null;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Filter to apply (inbox, important, trash, etc.) */
  filter?: EmailFilter;
}

/**
 * Hook for fetching emails in a thread, filtered by current view
 *
 * @example
 * const { data: threadEmails, isLoading } = useThreadQuery({
 *   threadId: 'thread-123',
 *   filter: 'important', // Only show important emails in thread
 * });
 */
export function useThreadQuery(options: UseThreadQueryOptions) {
  const { threadId, enabled = true, filter } = options;

  return useQuery({
    // Include filter in the query key to differentiate cache entries
    queryKey: [...emailKeys.thread(threadId ?? ''), { filter }],
    queryFn: async (): Promise<Email[]> => {
      if (!threadId) return [];

      const response = await emailService.fetchThread(threadId, filter);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch thread');
      }

      return response.data ?? [];
    },
    enabled: enabled && !!threadId,
  });
}

export default useThreadQuery;
