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
  direction: text('direction').notNull().$type<EmailDirection>().default(EmailDirection.INCOMING),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export type Email = typeof emails.$inferSelect;
export type EmailData = typeof emails.$inferInsert;
