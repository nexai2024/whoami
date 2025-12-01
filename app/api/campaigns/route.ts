/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user
 * 
 * POST /api/campaigns
 * Create a new campaign manually (without AI generation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CampaignStatus } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { listCampaigns } from '@/lib/services/campaignService';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    logger.info('Campaigns list request', { 
      userId,
      hasUserId: !!userId,
      headers: Object.fromEntries(request.headers.entries()),
    });

    if (!userId) {
      logger.warn('Campaigns list request without userId');
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

    logger.info('Fetching campaigns for user', { userId, status: parsedStatus });

    const campaigns = await listCampaigns({
      userId,
      filters: {
        status: parsedStatus,
      },
    });

    logger.info('Campaigns list returned', {
      userId,
      count: campaigns.length,
      campaignIds: campaigns.map(c => c.id),
    });

    return NextResponse.json({
      campaigns,
    });
  } catch (error) {
    logger.error('Error fetching campaigns', { 
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, goal, targetAudience, productId, blockId, customContent } = body as {
      name: string;
      goal?: string;
      targetAudience?: string;
      productId?: string;
      blockId?: string;
      customContent?: any;
    };

    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: 'Campaign name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Create campaign in DRAFT status for manual building
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        goal: goal || null,
        targetAudience: targetAudience || null,
        productId: productId || null,
        blockId: blockId || null,
        customContent: customContent || null,
        status: CampaignStatus.DRAFT,
      },
    });

    return NextResponse.json({
      campaignId: campaign.id,
      status: campaign.status,
    });
  } catch (error) {
    logger.error('Error creating campaign', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
