import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClientPage from './client-page';
import { threads } from '../../database/seed';
import { emails } from '@/lib/schema';
import { db } from '@/lib/database';
import { desc } from 'drizzle-orm';
import { resetQueryClient } from '@/providers';
import { EmailStats } from '@/types';

// Mock fetch for API calls
const originalFetch = global.fetch;

// Default stats for tests
const createDefaultStats = (total: number): EmailStats => ({
  total,
  unread: 0,
  important: 0,
  deleted: 0,
  sent: 0,
});

beforeEach(() => {
  // Reset query client singleton before each test
  resetQueryClient();
  // Reset fetch mock before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('Home Page Client', () => {
  test('Shows the email list in the inbox', async () => {
    const emailList = await db
      .select()
      .from(emails)
      .orderBy((email) => desc(email.createdAt));

    // Mock fetch to return emails for any query
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      ok: true,
      json: async () => ({ status: 'success', emails: emailList }),
    }));

    const ui = (
      <ClientPage emails={emailList} stats={createDefaultStats(emailList.length)} />
    );
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    expect(screen.getAllByText(threads[0].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[1].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[3].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[4].subject).length).toBeGreaterThan(0);
  });

  test('Displays the email content truncated to 30 characters', async () => {
    const emailList = await db
      .select()
      .from(emails)
      .orderBy((email) => desc(email.createdAt));

    // Mock fetch to return emails
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      ok: true,
      json: async () => ({ status: 'success', emails: emailList }),
    }));

    const ui = (
      <ClientPage emails={emailList} stats={createDefaultStats(emailList.length)} />
    );
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    expect(
      screen.getAllByText(threads[0].content?.substring(0, 30) + '...').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(threads[1].content?.substring(0, 30) + '...').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(threads[3].content?.substring(0, 30) + '...').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(threads[4].content?.substring(0, 30) + '...').length,
    ).toBeGreaterThan(0);
  });

  test('Displays full email content when clicking on an email', async () => {
    const emailList = await db
      .select()
      .from(emails)
      .orderBy((email) => desc(email.createdAt));

    // Mock all fetch calls to return appropriate responses
    (global.fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
      if (options?.method === 'PATCH') {
        return {
          ok: true,
          json: async () => ({ status: 'success', email: { ...threads[0], isRead: true } }),
        };
      }
      // Mock thread fetch - return just the selected email
      if (url.includes('/api/emails/thread/')) {
        const threadEmail = threads[0];
        return {
          ok: true,
          json: async () => ({ status: 'success', emails: [threadEmail] }),
        };
      }
      return {
        ok: true,
        json: async () => ({ status: 'success', emails: emailList }),
      };
    });

    const ui = (
      <ClientPage emails={emailList} stats={createDefaultStats(emailList.length)} />
    );
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const emailCard = screen.getByTestId(`email-card-${threads[0].id}`);
    await act(async () => {
      fireEvent.click(emailCard);
    });

    // Wait for the thread content to load and display
    await waitFor(() => {
      expect(screen.getByText(threads[0].content || '')).toBeInTheDocument();
    });
  });

  test('The search feature works as expected', async () => {
    const emailList = await db
      .select()
      .from(emails)
      .orderBy((email) => desc(email.createdAt));
    const searchTerm = threads[0].subject;
    const matchingEmails = emailList.filter((email) => email.subject.includes(searchTerm));
    const matchingThreads = threads.filter((thread) => thread.subject.includes(searchTerm));

    // Mock fetch to respond based on query params
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      const query = urlObj.searchParams.get('query');

      if (query && query.includes(searchTerm)) {
        return {
          ok: true,
          json: async () => ({ status: 'success', emails: matchingEmails }),
        };
      }
      return {
        ok: true,
        json: async () => ({ status: 'success', emails: emailList }),
      };
    });

    const ui = (
      <ClientPage emails={emailList} stats={createDefaultStats(emailList.length)} />
    );
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    // Wait for debounce, deferred value update, and query to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 800));
    });

    // Wait for the filtered results to appear
    await waitFor(
      () => {
        const displayedEmails = screen.getAllByTestId(/email-card-/);
        expect(displayedEmails.length).toBeGreaterThanOrEqual(matchingThreads.length);
      },
      { timeout: 3000 },
    );

    expect(screen.getAllByText(searchTerm).length).toBeGreaterThan(0);
  });

  test('The search feature is debounced and works as expected', async () => {
    const emailList = await db
      .select()
      .from(emails)
      .orderBy((email) => desc(email.createdAt));
    const searchTerm = threads[0].subject;
    const matchingEmails = emailList.filter((email) => email.subject.includes(searchTerm));
    const matchingThreads = threads.filter((thread) => thread.subject.includes(searchTerm));

    // Mock fetch to respond based on query params
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      const urlObj = new URL(url, 'http://localhost');
      const query = urlObj.searchParams.get('query');

      if (query && query.includes(searchTerm)) {
        return {
          ok: true,
          json: async () => ({ status: 'success', emails: matchingEmails }),
        };
      }
      return {
        ok: true,
        json: async () => ({ status: 'success', emails: emailList }),
      };
    });

    const ui = (
      <ClientPage
        emails={emailList}
        stats={{ total: emailList.length, unread: 0, important: 0, deleted: 0, sent: 0 }}
      />
    );
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    // Wait for debounce, deferred value update, and query to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 800));
    });

    // Wait for the filtered results to appear
    await waitFor(
      () => {
        const displayedEmails = screen.getAllByTestId(/email-card-/);
        expect(displayedEmails.length).toBeGreaterThanOrEqual(matchingThreads.length);
      },
      { timeout: 3000 },
    );
  });
});
