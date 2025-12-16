/**
 * Thread API Route
 * Fetches emails in a specific thread, filtered by the current view
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { emails } from '@/lib/schema';
import { eq, asc, and } from 'drizzle-orm';
import { EmailFilter } from '@/types';

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

/**
 * Builds the filter condition based on the view
 */
function getThreadFilterCondition(threadId: string, filter?: EmailFilter) {
  const baseCondition = eq(emails.threadId, threadId);

  switch (filter) {
    case 'trash':
      // Show only deleted emails in thread
      return and(baseCondition, eq(emails.isDeleted, true));
    case 'important':
      // Show only important (non-deleted) emails in thread
      return and(baseCondition, eq(emails.isImportant, true), eq(emails.isDeleted, false));
    default:
      // Show all non-deleted emails in thread
      return and(baseCondition, eq(emails.isDeleted, false));
  }
}

/**
 * GET /api/emails/thread/[threadId]
 * Returns emails in a thread filtered by view, ordered by creation date (oldest first)
 * Query params:
 *   - filter: 'inbox' | 'important' | 'trash' | etc.
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') as EmailFilter | null;

    if (!threadId) {
      return NextResponse.json(
        { status: 'error', error: 'Thread ID is required' },
        { status: 400 },
      );
    }

    const threadEmails = await db
      .select()
      .from(emails)
      .where(getThreadFilterCondition(threadId, filter || undefined))
      .orderBy(asc(emails.createdAt));

    return NextResponse.json({
      status: 'success',
      emails: threadEmails,
      count: threadEmails.length,
    });
  } catch (error) {
    console.error('GET /api/emails/thread error:', error);
    return NextResponse.json({ status: 'error', error: 'Failed to fetch thread' }, { status: 500 });
  }
}
