/**
 * Email Service - API client for email operations
 * Centralized service layer for all email-related API calls
 */

import {
  Email,
  EmailStats,
  CreateEmailRequest,
  SearchEmailsRequest,
  ApiResponse,
} from '@/types/email';
import { apiRequest } from '@/lib/apiClient';

const API_BASE = '/api/emails';

/** Response type for mutations that update email state */
export interface EmailUpdateResponse {
  email: Email;
  stats: EmailStats;
}

/** Builds query string from search parameters */
function buildQueryString(params: SearchEmailsRequest): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/** Fetches emails with optional search and filter parameters */
export async function fetchEmails(params: SearchEmailsRequest = {}): Promise<ApiResponse<Email[]>> {
  const result = await apiRequest<{ emails: Email[] }>(`${API_BASE}${buildQueryString(params)}`);
  return result.success
    ? { status: 'success', data: result.data.emails }
    : { status: 'error', error: result.error };
}

/** Creates a new email */
export async function createEmail(emailData: CreateEmailRequest): Promise<ApiResponse<Email>> {
  const result = await apiRequest<{ email: Email }>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(emailData),
  });
  return result.success
    ? { status: 'success', data: result.data.email }
    : { status: 'error', error: result.error };
}

/** Deletes an email by ID or emails in a thread matching the filter */
export async function deleteEmail(
  emailId: number,
  threadId?: string,
  filter?: string,
): Promise<ApiResponse<void>> {
  const params = threadId
    ? `threadId=${threadId}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`
    : `id=${emailId}`;

  const result = await apiRequest<void>(`${API_BASE}?${params}`, { method: 'DELETE' });
  return result.success
    ? { status: 'success' }
    : { status: 'error', error: result.error };
}

/** Marks an email as read */
export async function markAsRead(emailId: number): Promise<ApiResponse<EmailUpdateResponse>> {
  return patchEmail({ id: emailId, isRead: true });
}

/** Toggles the important flag on an email or all emails in a thread */
export async function toggleImportant(
  emailId: number,
  isImportant: boolean,
  threadId?: string,
): Promise<ApiResponse<EmailUpdateResponse>> {
  return patchEmail(threadId ? { threadId, isImportant } : { id: emailId, isImportant });
}

/** Restores an email or all emails in a thread from trash */
export async function restoreEmail(
  emailId: number,
  threadId?: string,
): Promise<ApiResponse<EmailUpdateResponse>> {
  return patchEmail(threadId ? { threadId, isDeleted: false } : { id: emailId, isDeleted: false });
}

/** Helper for PATCH requests */
async function patchEmail(
  body: Record<string, unknown>,
): Promise<ApiResponse<EmailUpdateResponse>> {
  const result = await apiRequest<{ email: Email; stats: EmailStats }>(API_BASE, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return result.success
    ? { status: 'success', data: { email: result.data.email, stats: result.data.stats } }
    : { status: 'error', error: result.error };
}

/** Fetches global email statistics */
export async function fetchStats(): Promise<ApiResponse<EmailStats>> {
  const result = await apiRequest<{ data: EmailStats }>(`${API_BASE}/stats`);
  return result.success
    ? { status: 'success', data: result.data.data }
    : { status: 'error', error: result.error };
}

/** Fetches emails in a thread, filtered by current view */
export async function fetchThread(
  threadId: string,
  filter?: string,
): Promise<ApiResponse<Email[]>> {
  const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  const result = await apiRequest<{ emails: Email[] }>(
    `${API_BASE}/thread/${encodeURIComponent(threadId)}${params}`,
  );
  return result.success
    ? { status: 'success', data: result.data.emails }
    : { status: 'error', error: result.error };
}

export const emailService = {
  fetchEmails,
  fetchStats,
  fetchThread,
  createEmail,
  deleteEmail,
  markAsRead,
  toggleImportant,
  restoreEmail,
};

export default emailService;
