/**
 * Common utility functions
 * Centralized utilities to avoid duplication across components
 */

/**
 * Extracts initials from an email address for avatar display
 */
export function getInitials(email: string): string {
  const name = email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
}

/**
 * Extracts display name from email address
 * Converts "john.doe@example.com" to "John Doe"
 */
export function getDisplayName(email: string): string {
  const name = email.split('@')[0];
  return name
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Formats date for compact display in email lists
 * Shows time if today, otherwise shows date
 */
export function formatCompactDate(date: Date): string {
  const now = new Date();
  const emailDate = new Date(date);
  const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return emailDate.toLocaleDateString();
}

/**
 * Formats date for short display in conversation view
 */
export function formatShortDate(date: Date): string {
  const emailDate = new Date(date);
  return emailDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats date for full display in email viewer
 */
export function formatFullDate(date: Date): string {
  const emailDate = new Date(date);
  return emailDate.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncates content for preview display
 */
export function truncateText(text: string | null, maxLength: number = 30): string {
  if (!text) return 'No content';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Generates a unique thread ID for new email threads
 */
export function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates a single email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a comma-separated list of email addresses
 * Returns true if empty (for optional fields) or all emails are valid
 */
export function validateEmailList(emails: string): boolean {
  if (!emails.trim()) return true;
  return emails.split(',').every((email) => isValidEmail(email.trim()));
}
