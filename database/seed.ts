import { db } from '@/lib/database';
import { Email, EmailDirection, emails } from '@/lib/schema';

// Create sample emails organized into threads
export const emailData: Email[] = [
  // Thread 1: Project Discussion (5 emails)
  {
    id: 1,
    threadId: 'thread-001',
    subject: 'New Project Proposal',
    from: 'sarah.johnson@company.com',
    to: 'team@company.com',
    content: 'Hi team, I\'d like to propose a new project for Q1. Let me know your thoughts on the attached proposal.',
    isRead: false,
    isImportant: true,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    threadId: 'thread-001',
    subject: 'Re: New Project Proposal',
    from: 'mike.chen@company.com',
    to: 'team@company.com',
    content: 'Great idea Sarah! I think this aligns well with our current goals. I have some suggestions for the timeline.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 3,
    threadId: 'thread-001',
    subject: 'Re: New Project Proposal',
    from: 'lisa.wang@company.com',
    to: 'team@company.com',
    content: 'I agree with Mike. The proposal looks solid. When can we schedule a meeting to discuss the details?',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-03'),
  },
  {
    id: 4,
    threadId: 'thread-001',
    subject: 'Re: New Project Proposal',
    from: 'sarah.johnson@company.com',
    to: 'team@company.com',
    content: 'Thanks for the feedback! How about we meet this Friday at 2 PM? I\'ll send out a calendar invite.',
    isRead: false,
    isImportant: true,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-04'),
    updatedAt: new Date('2025-01-04'),
  },
  {
    id: 5,
    threadId: 'thread-001',
    subject: 'Re: New Project Proposal',
    from: 'david.kim@company.com',
    to: 'team@company.com',
    content: 'Friday works for me. Looking forward to the discussion!',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
  },

  // Thread 2: Client Communication (4 emails)
  {
    id: 6,
    threadId: 'thread-002',
    subject: 'Website Redesign Update',
    from: 'client@acmecorp.com',
    to: 'design@company.com',
    content: 'Hi team, we\'re really excited about the new design direction. When can we see the next iteration?',
    isRead: false,
    isImportant: true,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-06'),
    updatedAt: new Date('2025-01-06'),
  },
  {
    id: 7,
    threadId: 'thread-002',
    subject: 'Re: Website Redesign Update',
    from: 'design@company.com',
    to: 'client@acmecorp.com',
    content: 'Thanks for the feedback! We\'re working on the next version and should have something to show you by next Tuesday.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-07'),
    updatedAt: new Date('2025-01-07'),
  },
  {
    id: 8,
    threadId: 'thread-002',
    subject: 'Re: Website Redesign Update',
    from: 'client@acmecorp.com',
    to: 'design@company.com',
    content: 'Perfect! Looking forward to seeing the progress. The color scheme you chose is exactly what we had in mind.',
    isRead: false,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 9,
    threadId: 'thread-002',
    subject: 'Re: Website Redesign Update',
    from: 'design@company.com',
    to: 'client@acmecorp.com',
    content: 'Great to hear! We\'ll make sure to include the updated navigation structure in the next version.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-09'),
    updatedAt: new Date('2025-01-09'),
  },

  // Thread 3: Technical Discussion (4 emails)
  {
    id: 10,
    threadId: 'thread-003',
    subject: 'Database Performance Issue',
    from: 'devops@company.com',
    to: 'engineering@company.com',
    content: 'We\'re experiencing slow query performance on the user table. Anyone available to help investigate?',
    isRead: false,
    isImportant: true,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: 11,
    threadId: 'thread-003',
    subject: 'Re: Database Performance Issue',
    from: 'alex.rodriguez@company.com',
    to: 'engineering@company.com',
    content: 'I can help with this. I suspect it might be related to the new indexing strategy. Let me check the query logs.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
  },
  {
    id: 12,
    threadId: 'thread-003',
    subject: 'Re: Database Performance Issue',
    from: 'devops@company.com',
    to: 'engineering@company.com',
    content: 'Thanks Alex! I\'ve sent you the access credentials. The issue seems to be most prominent during peak hours.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
  },
  {
    id: 13,
    threadId: 'thread-003',
    subject: 'Re: Database Performance Issue',
    from: 'alex.rodriguez@company.com',
    to: 'engineering@company.com',
    content: 'Found the issue! There\'s a missing index on the created_at column. I\'ll implement the fix tonight.',
    isRead: false,
    isImportant: true,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13'),
  },

  // Thread 4: Marketing Campaign (3 emails)
  {
    id: 14,
    threadId: 'thread-004',
    subject: 'Q1 Marketing Campaign Ideas',
    from: 'marketing@company.com',
    to: 'team@company.com',
    content: 'Let\'s brainstorm some ideas for our Q1 campaign. I\'m thinking we focus on sustainability and innovation.',
    isRead: false,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
  },
  {
    id: 15,
    threadId: 'thread-004',
    subject: 'Re: Q1 Marketing Campaign Ideas',
    from: 'creative@company.com',
    to: 'team@company.com',
    content: 'Love the sustainability angle! We could create some compelling visuals around our eco-friendly initiatives.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 16,
    threadId: 'thread-004',
    subject: 'Re: Q1 Marketing Campaign Ideas',
    from: 'marketing@company.com',
    to: 'team@company.com',
    content: 'Excellent! Let\'s schedule a creative session next week to develop the concepts further.',
    isRead: false,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16'),
  },

  // Thread 5: Personal Messages (4 emails)
  {
    id: 17,
    threadId: 'thread-005',
    subject: 'Coffee Chat?',
    from: 'colleague@company.com',
    to: 'user@example.com',
    content: 'Hey! Would you like to grab coffee sometime this week? I\'d love to catch up and discuss the new project.',
    isRead: false,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-17'),
    updatedAt: new Date('2025-01-17'),
  },
  {
    id: 18,
    threadId: 'thread-004',
    subject: 'Re: Coffee Chat?',
    from: 'user@example.com',
    to: 'colleague@company.com',
    content: 'Absolutely! How about Wednesday afternoon? I\'m free after 2 PM.',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-18'),
  },
  {
    id: 19,
    threadId: 'thread-005',
    subject: 'Re: Coffee Chat?',
    from: 'colleague@company.com',
    to: 'user@example.com',
    content: 'Wednesday works perfectly! Let\'s meet at the coffee shop on 3rd street at 2:30 PM.',
    isRead: false,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-19'),
    updatedAt: new Date('2025-01-19'),
  },
  {
    id: 20,
    threadId: 'thread-005',
    subject: 'Re: Coffee Chat?',
    from: 'user@example.com',
    to: 'colleague@company.com',
    content: 'Perfect! See you there. Looking forward to it!',
    isRead: true,
    isImportant: false,
    direction: EmailDirection.INCOMING,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
];

export const threads: Email[] = [];
const seenThreads: Set<string> = new Set();

const mostRecentEmails = emailData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
for (const email of mostRecentEmails) {
  if (!seenThreads.has(email.threadId)) {
    threads.push(email);
    seenThreads.add(email.threadId);
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if data already exists to avoid duplicates
  const existingEmails = await db.select().from(emails);
  if (existingEmails.length > 0) {
    console.log('✅ Database already contains data. Skipping seed.');
    return;
  }

  const insertedEmails = await Promise.all(
    emailData.map(email => db.insert(emails).values(email).returning()),
  );

  console.log(`✅ Created ${insertedEmails.length} emails`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  });
