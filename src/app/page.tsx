import React from 'react';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/database';
import { emails } from '@/lib/schema';
import ClientPage from '@/app/client-page';

export default async function Home() {
  const emailListDef = await db.select().from(emails).orderBy(desc(emails.createdAt));

  return (
    <ClientPage emails={emailListDef} />
  );
}

