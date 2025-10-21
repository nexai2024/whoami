/**
 * Cron endpoint for processing scheduled posts
 * Should be triggered every 5 minutes by a cron service
 *
 * Example cron setup:
 * - Vercel Cron: Add to vercel.json
 * - External: Use services like Upstash QStash, EasyCron, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/jobs/processScheduledPosts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled posts cron job...');

    const result = await processScheduledPosts();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        processed: result.processed,
        published: result.published,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    });
  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
