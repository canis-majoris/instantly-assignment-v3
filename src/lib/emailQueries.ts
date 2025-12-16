/**
 * Email Query Builder
 * Shared logic for building email queries with filtering, search, and threading
 * Used by both server components and API routes
 */

import { db } from '@/lib/database';
import { emails, EmailDirection } from '@/lib/schema';
import { eq, or, like, desc, and, sql, SQL } from 'drizzle-orm';
import { EmailFilter, Email } from '@/types';

export interface EmailQueryParams {
  filter?: EmailFilter;
  query?: string;
  threaded?: boolean;
}

/**
 * Builds the WHERE clause based on filter type
 * Note: trash filter returns deleted items, all others exclude deleted items
 */
function getFilterCondition(filter: EmailFilter | undefined): SQL {
  switch (filter) {
    case 'trash':
      return eq(emails.isDeleted, true);
    case 'important':
      return and(eq(emails.isImportant, true), eq(emails.isDeleted, false))!;
    case 'sent':
      return and(eq(emails.direction, EmailDirection.OUTGOING), eq(emails.isDeleted, false))!;
    case 'unread':
      return and(eq(emails.isRead, false), eq(emails.isDeleted, false))!;
    case 'inbox':
    default:
      return and(eq(emails.direction, EmailDirection.INCOMING), eq(emails.isDeleted, false))!;
  }
}

/**
 * Builds search conditions for the query
 */
function getSearchConditions(query: string) {
  const searchTerm = `%${query}%`;
  return or(
    like(emails.subject, searchTerm),
    like(emails.to, searchTerm),
    like(emails.from, searchTerm),
    like(emails.content, searchTerm),
  );
}

/**
 * Builds a threaded query that gets the latest email per thread matching the given conditions
 */
async function fetchThreadedEmails(conditions: SQL[]): Promise<Email[]> {
  // Get latest email per thread that matches conditions
  const subquery = db
    .select({
      threadId: emails.threadId,
      maxCreatedAt: sql<number>`MAX(${emails.createdAt})`.as('max_created_at'),
    })
    .from(emails)
    .where(and(...conditions))
    .groupBy(emails.threadId)
    .as('latest');

  // Join to get full email records
  const result = await db
    .select()
    .from(emails)
    .innerJoin(
      subquery,
      and(eq(emails.threadId, subquery.threadId), eq(emails.createdAt, subquery.maxCreatedAt)),
    )
    .orderBy(desc(emails.createdAt));

  return result.map((row) => row.emails);
}

/**
 * Fetches emails with optional search, filter, and threading
 */
export async function fetchEmails(params: EmailQueryParams): Promise<Email[]> {
  const { filter, query, threaded } = params;

  // Build conditions array
  const conditions: SQL[] = [];

  // Add filter condition
  conditions.push(getFilterCondition(filter));

  // Add search condition
  if (query && query.trim()) {
    const searchCondition = getSearchConditions(query.trim());
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (threaded) {
    return fetchThreadedEmails(conditions);
  } else {
    // Non-threaded: return all emails matching conditions
    return db
      .select()
      .from(emails)
      .where(and(...conditions))
      .orderBy(desc(emails.createdAt));
  }
}
