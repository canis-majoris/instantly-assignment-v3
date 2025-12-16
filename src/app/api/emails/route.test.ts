import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from './route';
import { Email, emails, EmailDirection } from '@/lib/schema';
import { db } from '@/lib/database';
import { eq } from 'drizzle-orm';

// Track emails created during tests for cleanup
const createdEmailIds: number[] = [];

// Test fixture email
let testFixtureEmail: Email;

describe('emails API', () => {
  beforeAll(async () => {
    // Create test fixture data that tests can rely on
    const [email] = await db
      .insert(emails)
      .values({
        threadId: 'route-test-fixture-thread',
        subject: 'Route Test Fixture Email',
        from: 'fixture@test.com',
        to: 'me@company.com',
        content: 'Fixture content for route tests',
        isRead: false,
        isImportant: false,
        isDeleted: false,
        direction: EmailDirection.INCOMING,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    testFixtureEmail = email;
  });

  afterAll(async () => {
    // Clean up fixture email
    if (testFixtureEmail) {
      await db.delete(emails).where(eq(emails.id, testFixtureEmail.id));
    }
    // Clean up all emails created during tests
    for (const id of createdEmailIds) {
      await db.delete(emails).where(eq(emails.id, id));
    }
  });

  describe('POST /api/emails', () => {
    it('Creates a new email and writes it to the database', async () => {
      const emailData = {
        subject: 'Test Email - Route Test',
        to: 'test@test.com',
        content: 'Test content',
      };

      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      const returnedEmail = responseBody.email as Email;

      // Track for cleanup
      createdEmailIds.push(returnedEmail.id);

      expect(returnedEmail.id).toBeDefined();
      expect(returnedEmail.subject).toBe(emailData.subject);
      expect(returnedEmail.to).toBe(emailData.to);
      expect(returnedEmail.content).toBe(emailData.content);

      // Make sure the email was added to the database
      const databaseEntry = await db.select().from(emails).where(eq(emails.id, returnedEmail.id));

      // The entries should match
      expect(databaseEntry.length).toBe(1);
      expect(databaseEntry[0].subject).toBe(emailData.subject);
    });

    it('Returns error when subject is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify({ to: 'test@test.com' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.status).toBe('error');
      expect(body.error).toContain('Subject');
    });

    it('Returns error when recipient is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify({ subject: 'Test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.status).toBe('error');
      expect(body.error).toContain('Recipient');
    });

    it('Creates email with cc and bcc', async () => {
      const emailData = {
        subject: 'Test with CC/BCC - Route Test',
        to: 'main@test.com',
        cc: 'cc@test.com',
        bcc: 'bcc@test.com',
        content: 'Test content',
      };

      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const body = await response.json();
      createdEmailIds.push(body.email.id);

      expect(body.email.to).toContain('main@test.com');
      expect(body.email.to).toContain('cc:');
      expect(body.email.to).toContain('bcc:');
    });

    it('Creates email in existing thread when threadId provided', async () => {
      const threadId = testFixtureEmail.threadId;

      const emailData = {
        subject: 'Reply in thread - Route Test',
        to: 'test@test.com',
        content: 'Reply content',
        threadId,
      };

      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const body = await response.json();
      createdEmailIds.push(body.email.id);

      expect(body.email.threadId).toBe(threadId);
    });
  });

  describe('GET /api/emails', () => {
    it('Returns all emails when no search is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.emails).toBeDefined();
      expect(Array.isArray(responseBody.emails)).toBe(true);
    });

    it('Returns emails that match the search term', async () => {
      // Use the fixture email for search
      const searchTerm = testFixtureEmail.subject.substring(0, 10);

      const request = new NextRequest('http://localhost:3000/api/emails?query=' + encodeURIComponent(searchTerm), {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const returnedEmails = responseBody.emails as Email[];

      // Should return at least one result
      expect(returnedEmails.length).toBeGreaterThan(0);

      // All returned emails should contain the search term in subject or content
      returnedEmails.forEach((email) => {
        const matchesSubject = email.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesContent = email.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFrom = email.from.toLowerCase().includes(searchTerm.toLowerCase());
        expect(matchesSubject || matchesContent || matchesFrom).toBe(true);
      });
    });

    it('Returns threaded emails when threaded=true', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails?threaded=true', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.emails).toBeDefined();
    });

    it('Filters by inbox', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails?filter=inbox', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      body.emails.forEach((email: Email) => {
        expect(email.isDeleted).toBe(false);
      });
    });

    it('Filters by important', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails?filter=important', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      body.emails.forEach((email: Email) => {
        expect(email.isImportant).toBe(true);
        expect(email.isDeleted).toBe(false);
      });
    });

    it('Returns count in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'GET',
      });

      const response = await GET(request);
      const body = await response.json();

      expect(body.count).toBeDefined();
      expect(typeof body.count).toBe('number');
      expect(body.count).toBe(body.emails.length);
    });
  });

  describe('PATCH /api/emails', () => {
    it('Updates email isRead status', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'PATCH',
        body: JSON.stringify({ id: testFixtureEmail.id, isRead: true }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.email.isRead).toBe(true);
    });

    it('Updates email isImportant status', async () => {
      const newValue = !testFixtureEmail.isImportant;

      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'PATCH',
        body: JSON.stringify({ id: testFixtureEmail.id, isImportant: newValue }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.email.isImportant).toBe(newValue);

      // Restore original value
      await db.update(emails).set({ isImportant: testFixtureEmail.isImportant }).where(eq(emails.id, testFixtureEmail.id));
    });

    it('Updates all emails in thread when threadId provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'PATCH',
        body: JSON.stringify({ threadId: testFixtureEmail.threadId, isRead: true }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.emails).toBeDefined();
      expect(Array.isArray(body.emails)).toBe(true);
    });

    it('Returns error when no id or threadId provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.status).toBe('error');
    });

    it('Returns updated stats after patch', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'PATCH',
        body: JSON.stringify({ id: testFixtureEmail.id, isRead: true }),
      });

      const response = await PATCH(request);
      const body = await response.json();

      expect(body.stats).toBeDefined();
    });
  });

  describe('DELETE /api/emails', () => {
    it('Soft-deletes email by id', async () => {
      // Create a test email to delete
      const [testEmail] = await db
        .insert(emails)
        .values({
          threadId: 'test-delete-thread',
          subject: 'To be deleted',
          from: 'test@test.com',
          to: 'me@company.com',
          content: 'Delete me',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const request = new NextRequest(`http://localhost:3000/api/emails?id=${testEmail.id}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('success');

      // Verify email is soft-deleted
      const [deleted] = await db.select().from(emails).where(eq(emails.id, testEmail.id));
      expect(deleted.isDeleted).toBe(true);

      // Cleanup
      await db.delete(emails).where(eq(emails.id, testEmail.id));
    });

    it('Returns error for invalid email id', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails?id=invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toContain('Invalid');
    });

    it('Returns error when no id or threadId provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
    });

    it('Soft-deletes entire thread when threadId provided', async () => {
      // Create test emails in a thread
      const threadId = 'test-delete-thread-batch';
      await db.insert(emails).values([
        {
          threadId,
          subject: 'Thread email 1',
          from: 'test@test.com',
          to: 'me@company.com',
          content: 'Content 1',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          threadId,
          subject: 'Thread email 2',
          from: 'test@test.com',
          to: 'me@company.com',
          content: 'Content 2',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const request = new NextRequest(`http://localhost:3000/api/emails?threadId=${threadId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);

      // Verify all emails in thread are soft-deleted
      const threadEmails = await db.select().from(emails).where(eq(emails.threadId, threadId));
      threadEmails.forEach((email) => {
        expect(email.isDeleted).toBe(true);
      });

      // Cleanup
      await db.delete(emails).where(eq(emails.threadId, threadId));
    });

    it('Returns updated stats after delete', async () => {
      const [testEmail] = await db
        .insert(emails)
        .values({
          threadId: 'test-stats-thread',
          subject: 'Test stats',
          from: 'test@test.com',
          to: 'me@company.com',
          content: 'Test',
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const request = new NextRequest(`http://localhost:3000/api/emails?id=${testEmail.id}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const body = await response.json();

      expect(body.stats).toBeDefined();

      // Cleanup
      await db.delete(emails).where(eq(emails.id, testEmail.id));
    });
  });
});
