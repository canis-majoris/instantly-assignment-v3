/**
 * Email Stats API Route
 * Returns global email statistics from the lookup table
 */

import { NextResponse } from 'next/server';
import { getStats } from '@/lib/statsQueries';
import { EmailStats, ApiResponse } from '@/types';

/**
 * GET /api/emails/stats
 * Returns pre-computed email statistics from the lookup table
 */
export async function GET(): Promise<NextResponse<ApiResponse<EmailStats>>> {
  try {
    const stats = await getStats();

    return NextResponse.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch email statistics',
      },
      { status: 500 },
    );
  }
}
