/**
 * POST /api/analytics/clicks
 * Record a click event
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/database/analytics';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const clickData = await req.json();

    // Validate required fields
    if (!clickData.pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    const click = await AnalyticsService.recordClick(clickData);
    return NextResponse.json(click, { status: 201 });
  } catch (error) {
    logger.error('Error recording click:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to record click: ${errorMessage}` },
      { status: 500 }
    );
  }
}
