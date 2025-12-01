/**
 * GET /api/campaigns/[id]
 * Get full campaign with all assets
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { getCampaign } from '@/lib/services/campaignService';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      logger.warn('Campaign detail request without userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;
    
    logger.info('Fetching campaign detail', { campaignId, userId });

    if (!campaignId) {
      logger.warn('Campaign detail request without campaignId');
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaign = await getCampaign({
      userId,
      campaignId,
    });

    if (!campaign) {
      logger.warn('Campaign not found in getCampaign', { campaignId, userId });
      
      // Try to find the campaign without userId check to see if it exists
      const campaignExists = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, userId: true },
      });
      
      if (campaignExists) {
        logger.warn('Campaign exists but userId mismatch', {
          campaignId,
          requestedUserId: userId,
          campaignUserId: campaignExists.userId,
        });
        return NextResponse.json(
          { error: 'Campaign not found or access denied' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    logger.info('Campaign detail fetched successfully', {
      campaignId,
      assetCount: campaign.assets.length,
    });

    return NextResponse.json({
      campaign,
    });
  } catch (error) {
    logger.error('Error fetching campaign detail', { 
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
