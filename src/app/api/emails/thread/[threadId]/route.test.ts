/**
 * Tests for Thread API Route
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import { db } from '@/lib/database';
import { emails, EmailDirection } from '@/lib/schema';
import { eq } from 'drizzle-orm';

describe('thread API', () => {
  const TEST_THREAD_ID = 'test-thread-for-api';

  // Setup: Create test emails before tests run
  beforeAll(async () => {
    await db.insert(emails).values([
      {
        threadId: TEST_THREAD_ID,
        subject: 'Thread Test Email 1',
        from: 'sender@test.com',
        to: 'me@company.com',
        content: 'First email in thread',
        isRead: true,
        isImportant: true,
        isDeleted: false,
        direction: EmailDirection.INCOMING,
        createdAt: new Date('2025-01-01T10:00:00'),
        updatedAt: new Date(),
      },
      {
        threadId: TEST_THREAD_ID,
        subject: 'Re: Thread Test Email 1',
        from: 'me@company.com',
        to: 'sender@test.com',
        content: 'Second email in thread',
        isRead: true,
        isImportant: false,
        isDeleted: false,
        direction: EmailDirection.OUTGOING,
        createdAt: new Date('2025-01-01T11:00:00'),
        updatedAt: new Date(),
      },
      {
        threadId: TEST_THREAD_ID,
        subject: 'Re: Thread Test Email 1',
        from: 'sender@test.com',
        to: 'me@company.com',
        content: 'Third email in thread',
        isRead: false,
        isImportant: false,
        isDeleted: false,
        direction: EmailDirection.INCOMING,
        createdAt: new Date('2025-01-01T12:00:00'),
        updatedAt: new Date(),
      },
    ]);
  });

  // Cleanup: Remove test emails after tests complete
  afterAll(async () => {
    await db.delete(emails).where(eq(emails.threadId, TEST_THREAD_ID));
  });

  describe('GET /api/emails/thread/[threadId]', () => {
    it('returns emails for a valid thread', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/emails/thread/${TEST_THREAD_ID}`,
        { method: 'GET' },
      );

      const response = await GET(request, { params: Promise.resolve({ threadId: TEST_THREAD_ID }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(Array.isArray(body.emails)).toBe(true);
      expect(body.count).toBe(3);
    });

    it('returns empty array for non-existent thread', async () => {
      const threadId = 'non-existent-thread-id';

      const request = new NextRequest(`http://localhost:3000/api/emails/thread/${threadId}`, {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ threadId }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.emails).toEqual([]);
      expect(body.count).toBe(0);
    });

    it('filters by important when filter=important', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/emails/thread/${TEST_THREAD_ID}?filter=important`,
        { method: 'GET' },
      );

      const response = await GET(request, { params: Promise.resolve({ threadId: TEST_THREAD_ID }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.count).toBe(1);

      // All returned emails should be important
      body.emails.forEach((email: { isImportant: boolean; isDeleted: boolean }) => {
        expect(email.isImportant).toBe(true);
        expect(email.isDeleted).toBe(false);
      });
    });

    it('filters by trash when filter=trash', async () => {
      // Mark one email as deleted for testing
      const [emailToDelete] = await db
        .select()
        .from(emails)
        .where(eq(emails.threadId, TEST_THREAD_ID))
        .limit(1);

      await db.update(emails).set({ isDeleted: true }).where(eq(emails.id, emailToDelete.id));

      const request = new NextRequest(
        `http://localhost:3000/api/emails/thread/${TEST_THREAD_ID}?filter=trash`,
        { method: 'GET' },
      );

      const response = await GET(request, { params: Promise.resolve({ threadId: TEST_THREAD_ID }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.count).toBe(1);

      // All returned emails should be deleted
      body.emails.forEach((email: { isDeleted: boolean }) => {
        expect(email.isDeleted).toBe(true);
      });

      // Restore the email
      await db.update(emails).set({ isDeleted: false }).where(eq(emails.id, emailToDelete.id));
    });

    it('returns emails ordered by creation date (oldest first)', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/emails/thread/${TEST_THREAD_ID}`,
        { method: 'GET' },
      );

      const response = await GET(request, { params: Promise.resolve({ threadId: TEST_THREAD_ID }) });
      const body = await response.json();

      expect(body.emails.length).toBe(3);

      for (let i = 1; i < body.emails.length; i++) {
        const prevDate = new Date(body.emails[i - 1].createdAt).getTime();
        const currDate = new Date(body.emails[i].createdAt).getTime();
        expect(currDate).toBeGreaterThanOrEqual(prevDate);
      }
    });
  });
});
