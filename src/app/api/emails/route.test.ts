import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { Email, EmailData, EmailDirection, emails } from '@/lib/schema';
import { threads } from '../../../../database/seed';
import { db } from '@/lib/database';
import { eq } from 'drizzle-orm';

describe('emails API', () => {
  describe('POST /api/emails', () => {
    it('Creates a new email and writes it to the database', async () => {
      const emailData: EmailData = {
        subject: 'Test Email',
        from: 'test@test.com',
        to: 'test@test.com',
        content: 'Test content',
        isRead: false,
        isImportant: false,
        direction: EmailDirection.INCOMING,
        threadId: 'test-thread-id',
      };

      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const returnedEmail = await response.json() as Email;

      expect(returnedEmail.id).toBeDefined();
      expect(returnedEmail.subject).toBe(emailData.subject);
      expect(returnedEmail.from).toBe(emailData.from);
      expect(returnedEmail.to).toBe(emailData.to);
      expect(returnedEmail.content).toBe(emailData.content);
      expect(returnedEmail.isRead).toBe(emailData.isRead);
      expect(returnedEmail.isImportant).toBe(emailData.isImportant);
      expect(returnedEmail.direction).toBe(emailData.direction);
      expect(returnedEmail.threadId).toBe(emailData.threadId);

      // Make sure the email was added to the database
      const databaseEntry = await db.select().from(emails).where(eq(emails.id, returnedEmail.id));

      // The entries should match
      expect(JSON.stringify(returnedEmail)).toEqual(JSON.stringify(databaseEntry[0]));
    });
  });

  describe('GET /api/emails', () => {
    it('Returns all emails when no search is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/emails', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    it('Returns emails that match the search term', async () => {
      const searchTerm = (threads[0].subject).substring(0, 10);

      const request = new NextRequest('http://localhost:3000/api/emails?search=' + searchTerm, {
        method: 'GET',
      });

      const matchingThreads = threads.filter(thread => thread.subject.includes(searchTerm));

      const response = await GET(request);

      const returnedEmails = await response.json() as Email[];

      const returnedIds = returnedEmails.map(email => email.id);

      matchingThreads.forEach((thread) => {
        expect(returnedIds).toContain(thread.id);
      });
    });
  });
});
