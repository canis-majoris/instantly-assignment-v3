/**
 * Stats Service - Manages the email stats lookup table
 * Provides functions to recalculate and update denormalized stats
 */

import { db } from '@/lib/database';
import { emails, emailStats, EmailDirection } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import { EmailStats } from '@/types';

const STATS_ROW_ID = 1;

/**
 * Recalculates all stats from the emails table
 * This is an expensive operation - use sparingly (e.g., on init or recovery)
 */
export async function recalculateStats(): Promise<EmailStats> {
  // Get individual email count for inbox (incoming emails, not deleted)
  const inboxResult = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(emails)
    .where(and(eq(emails.direction, EmailDirection.INCOMING), eq(emails.isDeleted, false)));

  // Get unread individual email count (not deleted)
  const unreadResult = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(emails)
    .where(
      and(
        eq(emails.direction, EmailDirection.INCOMING),
        eq(emails.isRead, false),
        eq(emails.isDeleted, false),
      ),
    );

  // Get important email count (individual emails, not threads, not deleted)
  const importantResult = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(emails)
    .where(and(eq(emails.isImportant, true), eq(emails.isDeleted, false)));

  // Get deleted email count
  const deletedResult = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(emails)
    .where(eq(emails.isDeleted, true));

  // Get sent individual email count (outgoing emails, not deleted)
  const sentResult = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(emails)
    .where(and(eq(emails.direction, EmailDirection.OUTGOING), eq(emails.isDeleted, false)));

  const stats: EmailStats = {
    total: Number(inboxResult[0]?.count ?? 0),
    unread: Number(unreadResult[0]?.count ?? 0),
    important: Number(importantResult[0]?.count ?? 0),
    deleted: Number(deletedResult[0]?.count ?? 0),
    sent: Number(sentResult[0]?.count ?? 0),
  };

  // Upsert stats row
  await db
    .insert(emailStats)
    .values({
      id: STATS_ROW_ID,
      inboxEmailCount: stats.total,
      unreadEmailCount: stats.unread,
      importantEmailCount: stats.important,
      sentEmailCount: stats.sent,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: emailStats.id,
      set: {
        inboxEmailCount: stats.total,
        unreadEmailCount: stats.unread,
        importantEmailCount: stats.important,
        sentEmailCount: stats.sent,
        updatedAt: new Date(),
      },
    });

  return stats;
}

/**
 * Gets cached stats from the lookup table
 * Falls back to recalculating if table is empty
 */
export async function getStats(): Promise<EmailStats> {
  const result = await db.select().from(emailStats).where(eq(emailStats.id, STATS_ROW_ID));

  if (result.length === 0) {
    // Stats table is empty - recalculate
    return recalculateStats();
  }

  const row = result[0];
  return {
    total: row.inboxEmailCount,
    unread: row.unreadEmailCount,
    important: row.importantEmailCount,
    deleted: 0, // Will be recalculated on next mutation
    sent: row.sentEmailCount,
  };
}

/**
 * Invalidates stats cache by triggering a full recalculation
 * Call this after any email mutation (create, delete, update)
 */
export async function invalidateStats(): Promise<void> {
  await recalculateStats();
}

export const statsService = {
  getStats,
  recalculateStats,
  invalidateStats,
};

export default statsService;
