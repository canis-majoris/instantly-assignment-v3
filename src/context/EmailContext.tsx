/**
 * Email Context - Global state management for emails with TanStack Query
 * Provides centralized email state and operations throughout the app
 */

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Email, EmailFilter, EmailStats } from '@/types';
import {
  useEmailsQuery,
  useStatsQuery,
  useDeleteEmail,
  useMarkAsRead,
  useToggleImportant,
  useRestoreEmail,
  useEmailUrlParams,
} from '@/hooks';

interface EmailContextState {
  emails: Email[];
  selectedEmail: Email | null;
  activeFilter: EmailFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  isThreaded: boolean;
  stats: EmailStats;
  setSelectedEmail: (email: Email | null) => void;
  setActiveFilter: (filter: EmailFilter) => void;
  setSearchQuery: (query: string) => void;
  setIsThreaded: (threaded: boolean) => void;
  refreshEmails: () => Promise<void>;
  deleteEmail: (emailId: number, threadId?: string, filter?: EmailFilter) => Promise<void>;
  restoreEmail: (emailId: number, threadId?: string) => Promise<void>;
  markAsRead: (emailId: number) => Promise<void>;
  toggleImportant: (emailId: number, currentIsImportant?: boolean, singleEmailOnly?: boolean) => Promise<void>;
}

const EmailContext = createContext<EmailContextState | undefined>(undefined);

const DEFAULT_STATS: EmailStats = { total: 0, unread: 0, important: 0, deleted: 0, sent: 0 };

export function EmailProvider({
  children,
  initialEmails,
  initialStats,
}: {
  children: ReactNode;
  initialEmails: Email[];
  initialStats: EmailStats;
}) {
  const {
    filter: activeFilter,
    setFilter: setActiveFilter,
    search: searchQuery,
    setSearch: setSearchQuery,
    threaded: isThreaded,
    setThreaded: setIsThreaded,
    selectedEmailId,
    setSelectedEmailId,
  } = useEmailUrlParams();

  const [selectedEmail, setSelectedEmailState] = useState<Email | null>(null);

  const {
    data: emails = [],
    isLoading,
    error: queryError,
    refetch,
  } = useEmailsQuery({
    query: searchQuery || undefined,
    filter: activeFilter,
    threaded: isThreaded,
    initialData: initialEmails,
  });

  const { data: stats = DEFAULT_STATS } = useStatsQuery(initialStats);

  // Mutations
  const deleteEmailMutation = useDeleteEmail();
  const restoreEmailMutation = useRestoreEmail();
  const markAsReadMutation = useMarkAsRead();
  const toggleImportantMutation = useToggleImportant();

  // Sync selected email from URL
  useEffect(() => {
    if (!selectedEmailId) {
      setSelectedEmailState(null);
    } else if (emails.length > 0) {
      const email = emails.find((e) => e.id === parseInt(selectedEmailId, 10));
      if (email) setSelectedEmailState(email);
    }
  }, [selectedEmailId, emails]);

  const setSelectedEmail = useCallback(
    (email: Email | null) => {
      setSelectedEmailState(email);
      setSelectedEmailId(email ? String(email.id) : null);
    },
    [setSelectedEmailId],
  );

  // Helper to clear selection if it matches the affected email/thread
  const clearSelectionIfMatches = useCallback(
    (emailId: number, threadId?: string) => {
      if (threadId ? selectedEmail?.threadId === threadId : selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    },
    [selectedEmail, setSelectedEmail],
  );

  // Find email by ID from list or selected
  const findEmail = useCallback(
    (emailId: number): Email | undefined => emails.find((e) => e.id === emailId) ?? (selectedEmail?.id === emailId ? selectedEmail : undefined),
    [emails, selectedEmail],
  );

  const handleDeleteEmail = useCallback(
    async (emailId: number, threadId?: string, filter?: EmailFilter) => {
      await deleteEmailMutation.mutateAsync({ emailId, threadId, filter });
      clearSelectionIfMatches(emailId, threadId);
    },
    [deleteEmailMutation, clearSelectionIfMatches],
  );

  const handleRestoreEmail = useCallback(
    async (emailId: number, threadId?: string) => {
      await restoreEmailMutation.mutateAsync({ emailId, threadId });
      clearSelectionIfMatches(emailId, threadId);
    },
    [restoreEmailMutation, clearSelectionIfMatches],
  );

  const handleMarkAsRead = useCallback(
    async (emailId: number) => {
      const result = await markAsReadMutation.mutateAsync(emailId);
      if (selectedEmail?.id === emailId && result) {
        setSelectedEmailState((prev) => (prev ? { ...prev, isRead: true } : null));
      }
    },
    [markAsReadMutation, selectedEmail],
  );

  const handleToggleImportant = useCallback(
    async (emailId: number, currentIsImportant?: boolean, singleEmailOnly?: boolean) => {
      const email = findEmail(emailId);
      const isImportant = currentIsImportant ?? email?.isImportant;
      if (isImportant === undefined) return;

      const threadId = isThreaded && !singleEmailOnly ? email?.threadId : undefined;
      const newState = !isImportant;

      await toggleImportantMutation.mutateAsync({ emailId, isImportant: newState, threadId });

      // Update selected email if affected
      const isAffected = selectedEmail?.id === emailId || (threadId && selectedEmail?.threadId === threadId);
      if (isAffected) {
        setSelectedEmailState((prev) => (prev ? { ...prev, isImportant: newState } : null));
      }
    },
    [findEmail, toggleImportantMutation, selectedEmail, isThreaded],
  );

  return (
    <EmailContext.Provider
      value={{
        emails,
        selectedEmail,
        activeFilter,
        searchQuery,
        isLoading,
        error: queryError?.message || null,
        isThreaded,
        stats,
        setSelectedEmail,
        setActiveFilter,
        setSearchQuery,
        setIsThreaded,
        refreshEmails: useCallback(async () => { await refetch(); }, [refetch]),
        deleteEmail: handleDeleteEmail,
        restoreEmail: handleRestoreEmail,
        markAsRead: handleMarkAsRead,
        toggleImportant: handleToggleImportant,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmailContext(): EmailContextState {
  const context = useContext(EmailContext);
  if (!context) throw new Error('useEmailContext must be used within an EmailProvider');
  return context;
}

export default EmailContext;
