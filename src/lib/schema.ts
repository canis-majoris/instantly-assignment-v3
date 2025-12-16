import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export enum EmailDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: text('thread_id').notNull(),
  subject: text('subject').notNull(),
  from: text('from').notNull(),
  to: text('to').notNull(),
  content: text('content'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  isImportant: integer('is_important', { mode: 'boolean' }).default(false).notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
  direction: text('direction').notNull().$type<EmailDirection>().default(EmailDirection.INCOMING),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Email = typeof emails.$inferSelect;
export type EmailData = typeof emails.$inferInsert;

/**
 * Email Stats Lookup Table
 * Denormalized stats for fast reads - updated incrementally on email changes
 * Single row table (id=1) that stores pre-computed thread-aware counts
 */
export const emailStats = sqliteTable('email_stats', {
  id: integer('id').primaryKey().default(1),
  // Count of individual emails in inbox (incoming emails)
  inboxEmailCount: integer('inbox_email_count').default(0).notNull(),
  // Count of individual unread incoming emails
  unreadEmailCount: integer('unread_email_count').default(0).notNull(),
  // Count of individual important emails
  importantEmailCount: integer('important_email_count').default(0).notNull(),
  // Count of individual sent emails (outgoing emails)
  sentEmailCount: integer('sent_email_count').default(0).notNull(),
  // Last time stats were recalculated
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type EmailStatsRow = typeof emailStats.$inferSelect;
