/**
 * useEmailMutations - TanStack Query mutations for email operations
 * Provides optimistic updates and automatic cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Email, EmailStats, CreateEmailRequest } from '@/types';
import { emailService } from '@/services';
import { emailKeys } from './queryKeys';

/**
 * Hook for creating a new email
 *
 * @example
 * const { mutate: createEmail, isPending } = useCreateEmail();
 * createEmail({ subject: 'Hello', to: 'test@test.com', content: 'Hi!' });
 */
export function useCreateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailData: CreateEmailRequest) => {
      const response = await emailService.createEmail(emailData);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to create email');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate all email lists, threads, and stats to refetch with the new email
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailKeys.threads() });
      queryClient.invalidateQueries({ queryKey: emailKeys.stats() });
    },
  });
}

interface DeleteEmailParams {
  emailId: number;
  threadId?: string;
  filter?: string;
}

/**
 * Hook for deleting an email or emails in a thread matching the filter
 *
 * @example
 * const { mutate: deleteEmail, isPending } = useDeleteEmail();
 * deleteEmail({ emailId: 1 }); // Delete single email
 * deleteEmail({ emailId: 1, threadId: 'thread-123' }); // Delete entire thread
 * deleteEmail({ emailId: 1, threadId: 'thread-123', filter: 'important' }); // Delete only important emails in thread
 */
export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, threadId, filter }: DeleteEmailParams) => {
      const response = await emailService.deleteEmail(emailId, threadId, filter);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to delete email');
      }

      return { emailId, threadId };
    },
    onMutate: async ({ emailId, threadId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: emailKeys.lists() });

      // Snapshot the previous value
      const previousEmails = queryClient.getQueriesData<Email[]>({ queryKey: emailKeys.lists() });

      // Optimistically update all email lists
      queryClient.setQueriesData<Email[]>(
        { queryKey: emailKeys.lists() },
        (old) =>
          old?.filter((email) => (threadId ? email.threadId !== threadId : email.id !== emailId)) ??
          [],
      );

      return { previousEmails };
    },
    onError: (_err, _params, context) => {
      // Rollback on error
      if (context?.previousEmails) {
        context.previousEmails.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailKeys.threads() });
      queryClient.invalidateQueries({ queryKey: emailKeys.stats() });
    },
  });
}

/**
 * Hook for marking an email as read
 *
 * @example
 * const { mutate: markAsRead } = useMarkAsRead();
 * markAsRead(emailId);
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: number) => {
      const response = await emailService.markAsRead(emailId);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to mark email as read');
      }

      return response.data;
    },
    onMutate: async (emailId) => {
      await queryClient.cancelQueries({ queryKey: emailKeys.lists() });

      // Optimistically update email lists
      queryClient.setQueriesData<Email[]>(
        { queryKey: emailKeys.lists() },
        (old) =>
          old?.map((email) => (email.id === emailId ? { ...email, isRead: true } : email)) ?? [],
      );
    },
    onSuccess: (data) => {
      // Update stats from server response
      if (data?.stats) {
        queryClient.setQueryData<EmailStats>(emailKeys.stats(), data.stats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailKeys.threads() });
      queryClient.invalidateQueries({ queryKey: emailKeys.stats() });
    },
  });
}

interface ToggleImportantParams {
  emailId: number;
  isImportant: boolean;
  threadId?: string;
}

/**
 * Hook for toggling the important flag on an email or all emails in a thread
 *
 * @example
 * const { mutate: toggleImportant } = useToggleImportant();
 * toggleImportant({ emailId: 1, isImportant: true });
 * // For thread mode:
 * toggleImportant({ emailId: 1, isImportant: true, threadId: 'thread-123' });
 */
export function useToggleImportant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, isImportant, threadId }: ToggleImportantParams) => {
      const response = await emailService.toggleImportant(emailId, isImportant, threadId);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to update email');
      }

      return response.data;
    },
    onMutate: async ({ emailId, isImportant, threadId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: emailKeys.lists() });

      // Snapshot previous values
      const previousEmails = queryClient.getQueriesData<Email[]>({ queryKey: emailKeys.lists() });

      // Optimistically update email lists
      queryClient.setQueriesData<Email[]>(
        { queryKey: emailKeys.lists() },
        (old) =>
          old?.map((email) => {
            // If threadId is provided, update all emails in the thread
            if (threadId && email.threadId === threadId) {
              return { ...email, isImportant };
            }
            // Otherwise, just update the specific email
            if (!threadId && email.id === emailId) {
              return { ...email, isImportant };
            }
            return email;
          }) ?? [],
      );

      return { previousEmails };
    },
    onSuccess: (data) => {
      // Update stats from server response
      if (data?.stats) {
        queryClient.setQueryData<EmailStats>(emailKeys.stats(), data.stats);
      }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousEmails) {
        context.previousEmails.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailKeys.threads() });
      queryClient.invalidateQueries({ queryKey: emailKeys.stats() });
    },
  });
}

interface RestoreEmailParams {
  emailId: number;
  threadId?: string;
}

/**
 * Hook for restoring an email or all emails in a thread from trash
 *
 * @example
 * const { mutate: restoreEmail } = useRestoreEmail();
 * restoreEmail({ emailId: 1 }); // Restore single email
 * restoreEmail({ emailId: 1, threadId: 'thread-123' }); // Restore entire thread
 */
export function useRestoreEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emailId, threadId }: RestoreEmailParams) => {
      const response = await emailService.restoreEmail(emailId, threadId);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to restore email');
      }

      return { data: response.data, threadId };
    },
    onMutate: async ({ emailId, threadId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: emailKeys.lists() });

      // Snapshot previous values
      const previousEmails = queryClient.getQueriesData<Email[]>({ queryKey: emailKeys.lists() });

      // Optimistically remove from trash list
      queryClient.setQueriesData<Email[]>(
        { queryKey: emailKeys.lists() },
        (old) =>
          old?.filter((email) => (threadId ? email.threadId !== threadId : email.id !== emailId)) ??
          [],
      );

      return { previousEmails };
    },
    onSuccess: ({ data }) => {
      // Update stats from server response
      if (data?.stats) {
        queryClient.setQueryData<EmailStats>(emailKeys.stats(), data.stats);
      }
    },
    onError: (_err, _params, context) => {
      // Rollback on error
      if (context?.previousEmails) {
        context.previousEmails.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: emailKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailKeys.threads() });
      queryClient.invalidateQueries({ queryKey: emailKeys.stats() });
    },
  });
}

export const emailMutations = {
  useCreateEmail,
  useDeleteEmail,
  useMarkAsRead,
  useToggleImportant,
  useRestoreEmail,
};

export default emailMutations;
