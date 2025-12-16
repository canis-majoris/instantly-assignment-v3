import { act, fireEvent, render, screen } from '@testing-library/react';
import ClientPage from './client-page';
import { threads } from '../../database/seed';
import { emails } from '@/lib/schema';
import { db } from '@/lib/database';
import { desc } from 'drizzle-orm';

describe('Home Page Client', () => {
  test('Shows the email list in the inbox', async () => {
    const emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    const ui = <ClientPage emails={emailList} />;
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    expect(screen.getAllByText(threads[0].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[1].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[3].subject).length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[4].subject).length).toBeGreaterThan(0);
  });

  test('Displays the email content truncated to 30 characters', async () => {
    const emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    const ui = <ClientPage emails={emailList} />;
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    expect(screen.getAllByText(threads[0].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[1].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[3].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
    expect(screen.getAllByText(threads[4].content?.substring(0, 30) + '...').length).toBeGreaterThan(0);
  });

  test('Displays full email content when clicking on an email', async () => {
    const emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    const ui = <ClientPage emails={emailList} />;
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const emailCard = screen.getByTestId(`email-card-${threads[0].id}`);
    await act(async () => {
      fireEvent.click(emailCard);
    });

    expect(screen.getByText(threads[0].content || '')).toBeInTheDocument();
  });

  test('The search feature works as expected', async () => {
    const emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    const ui = <ClientPage emails={emailList} />;
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const searchTerm = threads[0].subject;

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    // In case debounce is implemented we want to wait for it
    await new Promise((r) => setTimeout(r, 1_000));

    const matchingThreads = threads.filter(thread => thread.subject.includes(searchTerm));
    // const nonMatchingThreads = threads.filter(thread => !thread.subject.includes(searchTerm));

    const matchingEmails = emailList.filter(email => email.subject.includes(searchTerm));
    // const nonMatchingEmails = emailList.filter(email => !email.subject.includes(searchTerm));

    expect(screen.getAllByText(searchTerm).length).toBeGreaterThan(0);

    // The nr of elements displayed should be between matchingThreads.length and matchingEmails.length
    const displayedEmails = screen.getAllByTestId(/email-card-/);
    expect(displayedEmails.length).toBeGreaterThanOrEqual(matchingThreads.length);
    expect(displayedEmails.length).toBeLessThanOrEqual(matchingEmails.length);
  });

  test('The search feature is debounced and works as expected', async () => {
    const emailList = await db.select().from(emails).orderBy((email) => desc(email.createdAt));
    const ui = <ClientPage emails={emailList} />;
    render(ui);

    // Wait for the email list to load first
    await screen.findByTestId('email-list');

    const searchTerm = threads[0].subject;

    const searchInput = screen.getByPlaceholderText('Search emails...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: searchTerm } });
    });

    // The email list should not update immediately if debounced
    let displayedEmails = screen.getAllByTestId(/email-card-/);
    expect(displayedEmails.length).toBe(emailList.length);

    await new Promise((r) => setTimeout(r, 1_000));

    const matchingThreads = threads.filter(thread => thread.subject.includes(searchTerm));
    // const nonMatchingThreads = threads.filter(thread => !thread.subject.includes(searchTerm));

    const matchingEmails = emailList.filter(email => email.subject.includes(searchTerm));
    // const nonMatchingEmails = emailList.filter(email => !email.subject.includes(searchTerm));

    // The nr of elements displayed should be between matchingThreads.length and matchingEmails.length
    displayedEmails = screen.getAllByTestId(/email-card-/);
    expect(displayedEmails.length).toBeGreaterThanOrEqual(matchingThreads.length);
    expect(displayedEmails.length).toBeLessThanOrEqual(matchingEmails.length);
  });
});
