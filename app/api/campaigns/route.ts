/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { CampaignStatus } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { listCampaigns } from '@/lib/services/campaignService';

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as CampaignStatus | null;

    let parsedStatus: CampaignStatus | undefined;
    if (status) {
      const normalized = status.toUpperCase();
      if (Object.values(CampaignStatus).includes(normalized as CampaignStatus)) {
        parsedStatus = normalized as CampaignStatus;
      } else {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
      }
    }

    const campaigns = await listCampaigns({
      userId,
      filters: {
        status: parsedStatus,
      },
    });

    return NextResponse.json({
      campaigns,
    });
  } catch (error) {
    logger.error('Error fetching campaigns', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
