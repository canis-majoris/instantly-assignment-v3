/**
 * useStatsQuery - TanStack Query hook for fetching global email stats
 * Stats are independent of the current filter and include thread-aware counts
 */

import { useQuery } from '@tanstack/react-query';
import { EmailStats } from '@/types';
import { emailService } from '@/services';
import { emailKeys } from './queryKeys';

/**
 * Default stats when no data is available
 */
const DEFAULT_STATS: EmailStats = {
  total: 0,
  unread: 0,
  important: 0,
  deleted: 0,
  sent: 0,
};

/**
 * Hook for fetching global email statistics with TanStack Query
 *
 * @param initialData - Optional initial stats from server-side rendering
 * @example
 * const { data: stats } = useStatsQuery();
 */
export function useStatsQuery(initialData?: EmailStats) {
  return useQuery({
    queryKey: emailKeys.stats(),
    queryFn: async () => {
      const response = await emailService.fetchStats();

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to fetch stats');
      }

      return response.data ?? DEFAULT_STATS;
    },
    initialData,
    // No staleTime - stats are invalidated manually on mutations
  });
}

export default useStatsQuery;
