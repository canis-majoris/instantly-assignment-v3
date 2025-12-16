/**
 * Email-related type definitions and constants
 * Centralized type system for the email client
 */

import { Email, EmailDirection } from '@/lib/schema';

// Re-export for convenience
export type { Email };
export { EmailDirection };

/**
 * Sidebar filter options
 */
export type EmailFilter = 'inbox' | 'important' | 'sent' | 'unread' | 'trash';

/**
 * Email form data for composing new emails
 */
export interface EmailComposerFormData {
  subject: string;
  to: string;
  cc: string;
  bcc: string;
  content: string;
}

/**
 * API request payload for creating emails
 */
export interface CreateEmailRequest {
  subject: string;
  to: string;
  cc?: string;
  bcc?: string;
  content: string;
  threadId?: string;
  direction?: EmailDirection;
}

/**
 * API request payload for searching emails
 */
export interface SearchEmailsRequest {
  query?: string;
  filter?: EmailFilter;
  threaded?: boolean;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

/**
 * Email statistics for display
 */
export interface EmailStats {
  total: number;
  unread: number;
  important: number;
  deleted: number;
  sent: number;
}

/**
 * Default values for the email composer form
 */
export const EMPTY_COMPOSER_FORM: EmailComposerFormData = {
  subject: '',
  to: '',
  cc: '',
  bcc: '',
  content: '',
};

/**
 * Debounce delay for search input (in milliseconds)
 */
export const SEARCH_DEBOUNCE_MS = 300;
