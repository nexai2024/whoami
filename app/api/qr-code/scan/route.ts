import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/database/analytics';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/qr-code/scan
 * Track QR code scan events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, source, userAgent, ipAddress } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    // Record QR code scan as a click event with special tracking
    await AnalyticsService.recordClick({
      pageId,
      blockId: null, // QR code is not a block
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      referer: null,
      device: null,
      browser: null,
      os: null,
      utmSource: 'qr_code',
      utmMedium: 'qr',
      utmCampaign: 'share',
      utmContent: source || 'direct_scan'
    });

    logger.info('QR code scan tracked', { pageId, source });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error tracking QR code scan:', error);
    return NextResponse.json(
      { error: 'Failed to track QR scan' },
      { status: 500 }
    );
  }
}

