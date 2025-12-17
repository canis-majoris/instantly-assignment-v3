import React, { Suspense } from 'react';
import ClientPage from '@/app/client-page';
import { fetchEmails } from '@/lib/emailQueries';
import { fetchStats } from '@/lib/statsQueries';
import { EmailFilter } from '@/types';
import { Box, CircularProgress } from '@mui/material';

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    q?: string;
    threaded?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse URL params with defaults
  const filter = (params.filter as EmailFilter) || 'inbox';
  const query = params.q || '';
  const threaded = params.threaded !== 'false'; // Default to true

  // Fetch emails using URL params
  const emailList = await fetchEmails({
    filter,
    query: query || undefined,
    threaded,
  });

  // Fetch stats for sidebar counters
  const stats = await fetchStats();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientPage emails={emailList} stats={stats} />
    </Suspense>
  );
}
