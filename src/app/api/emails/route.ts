/**
 * Email API Routes
 * Handles CRUD operations for emails with search, filtering, and threading support
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { emails, EmailDirection } from '@/lib/schema';
import { invalidateStats, recalculateStats } from '@/lib/statsQueries';
import { fetchEmails } from '@/lib/emailQueries';
import { generateThreadId } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { EmailFilter } from '@/types/email';

// Helper functions for consistent responses
const errorResponse = (error: string, status: number = 400) =>
  NextResponse.json({ status: 'error', error }, { status });

const successResponse = (data: object, status: number = 200) =>
  NextResponse.json({ status: 'success', ...data }, { status });

/**
 * GET /api/emails
 * Fetches emails with optional search, filter, and threading
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const emailList = await fetchEmails({
      filter: (searchParams.get('filter') as EmailFilter) || undefined,
      query: searchParams.get('query') || undefined,
      threaded: searchParams.get('threaded') === 'true',
    });

    return successResponse({ emails: emailList, count: emailList.length });
  } catch (error) {
    console.error('GET /api/emails error:', error);
    return errorResponse('Failed to fetch emails', 500);
  }
}

/**
 * POST /api/emails
 * Creates a new email (sending an email)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { subject, to, cc, bcc, content, threadId, direction } = await request.json();

    if (!subject?.trim()) return errorResponse('Subject is required');
    if (!to?.trim()) return errorResponse('Recipient (to) is required');

    const [email] = await db
      .insert(emails)
      .values({
        threadId: threadId || generateThreadId(),
        subject: subject.trim(),
        from: 'me@company.com',
        to: to.trim(),
        cc: cc?.trim() || null,
        bcc: bcc?.trim() || null,
        content: content?.trim() || '',
        isRead: true,
        isImportant: false,
        direction: direction || EmailDirection.OUTGOING,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await invalidateStats();
    return successResponse({ email }, 201);
  } catch (error) {
    console.error('POST /api/emails error:', error);
    return errorResponse('Failed to create email', 500);
  }
}

/**
 * PATCH /api/emails
 * Updates email(s) - single by id, or all in thread by threadId
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const { id, threadId, isRead, isImportant, isDeleted } = await request.json();

    if (!id && !threadId) return errorResponse('Email ID or Thread ID is required');

    const updateData = {
      updatedAt: new Date(),
      ...(isRead !== undefined && { isRead }),
      ...(isImportant !== undefined && { isImportant }),
      ...(isDeleted !== undefined && { isDeleted }),
    };

    const condition = threadId ? eq(emails.threadId, threadId) : eq(emails.id, id);
    const updatedEmails = await db.update(emails).set(updateData).where(condition).returning();

    if (!updatedEmails.length) return errorResponse('Email(s) not found', 404);

    const stats = await recalculateStats();
    return successResponse({ email: updatedEmails[0], emails: updatedEmails, stats });
  } catch (error) {
    console.error('PATCH /api/emails error:', error);
    return errorResponse('Failed to update email', 500);
  }
}

/**
 * DELETE /api/emails
 * Soft-deletes email(s) by id or threadId (with optional filter)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const threadId = searchParams.get('threadId');
    const filter = searchParams.get('filter') as EmailFilter | null;

    if (!id && !threadId) return errorResponse('Email ID or Thread ID is required');

    let condition;
    if (threadId) {
      const baseCondition = [eq(emails.threadId, threadId), eq(emails.isDeleted, false)];
      if (filter === 'important') baseCondition.push(eq(emails.isImportant, true));
      condition = and(...baseCondition);
    } else {
      const emailId = parseInt(id!, 10);
      if (isNaN(emailId)) return errorResponse('Invalid email ID');
      condition = eq(emails.id, emailId);
    }

    const deleted = await db
      .update(emails)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(condition)
      .returning();

    if (!deleted.length) return errorResponse('Email(s) not found', 404);

    const stats = await recalculateStats();
    return successResponse({ message: threadId ? 'Thread moved to trash' : 'Email moved to trash', stats });
  } catch (error) {
    console.error('DELETE /api/emails error:', error);
    return errorResponse('Failed to delete email', 500);
  }
}
