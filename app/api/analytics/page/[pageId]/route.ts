import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/database/analytics';
import { logger } from '@/lib/utils/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  try {
    const analytics = await AnalyticsService.getPageAnalytics(pageId, days);
    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    logger.error(`Error fetching page analytics for ${pageId}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch analytics: ${errorMessage}` },
      { status: 500 }
    );
  }
}
