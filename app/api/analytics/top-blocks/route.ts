/**
 * GET /api/analytics/top-blocks
 * Get top performing blocks for a page or user
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/database/analytics';
import { logger } from '@/lib/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('pageId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate that at least one of pageId or userId is provided
    if (!pageId) {
      return NextResponse.json(
        { error: 'Either pageId is required' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    } else {
    const topBlocks = await AnalyticsService.getTopPerformingBlocks(
      pageId || undefined,
        limit,
        userId
      );
 

    return NextResponse.json(topBlocks, { status: 200 });
    }
  } catch (error) {
    logger.error('Error fetching top performing blocks:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch top blocks: ${errorMessage}` },
      { status: 500 }
    );
  }
}
