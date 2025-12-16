/**
 * URL Search Params Hook
 * Uses nuqs for URL state syncing with proper parsing and defaults
 */

import { useQueryState, parseAsString, parseAsBoolean, parseAsStringLiteral } from 'nuqs';
import { EmailFilter } from '@/types';

/**
 * Valid email filter values for URL parsing
 */
const EMAIL_FILTERS = ['inbox', 'important', 'sent', 'unread', 'trash'] as const;

/**
 * Hook for managing email filter in URL
 * @returns [filter, setFilter] tuple
 */
export function useFilterParam() {
  return useQueryState('filter', parseAsStringLiteral(EMAIL_FILTERS).withDefault('inbox'));
}

/**
 * Hook for managing search query in URL
 * @returns [query, setQuery] tuple
 */
export function useSearchParam() {
  return useQueryState('q', parseAsString.withDefault(''));
}

/**
 * Hook for managing threaded view toggle in URL
 * @returns [isThreaded, setIsThreaded] tuple
 */
export function useThreadedParam() {
  return useQueryState('threaded', parseAsBoolean.withDefault(true));
}

/**
 * Hook for managing selected email ID in URL
 * @returns [emailId, setEmailId] tuple
 */
export function useSelectedEmailParam() {
  return useQueryState('email', parseAsString.withDefault(''));
}

/**
 * Combined hook for all email URL params
 */
export function useEmailUrlParams() {
  const [filter, setFilter] = useFilterParam();
  const [search, setSearch] = useSearchParam();
  const [threaded, setThreaded] = useThreadedParam();
  const [selectedEmailId, setSelectedEmailId] = useSelectedEmailParam();

  return {
    filter: filter as EmailFilter,
    setFilter,
    search,
    setSearch,
    threaded,
    setThreaded,
    selectedEmailId,
    setSelectedEmailId,
  };
}
