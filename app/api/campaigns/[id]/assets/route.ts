/**
 * POST /api/campaigns/[id]/assets
 * Create a new asset for a campaign manually
 * 
 * PUT /api/campaigns/[id]/assets/[assetId]
 * Update an existing asset
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import prisma from '@/lib/prisma';
import { AssetType, AssetStatus, Platform } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;
    const body = await request.json();

    const { type, platform, content, mediaUrl } = body as {
      type: AssetType;
      platform?: Platform | null;
      content: string;
      mediaUrl?: string | null;
    };

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    // Verify campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Create the asset
    const asset = await prisma.campaignAsset.create({
      data: {
        campaignId,
        type,
        platform: platform || null,
        content,
        mediaUrl: mediaUrl || null,
        status: AssetStatus.DRAFT,
      },
    });

    // Update campaign status to READY if it was FAILED or DRAFT
    if (campaign.status === 'FAILED' || campaign.status === 'DRAFT') {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'READY' },
      });
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        type: asset.type,
        platform: asset.platform,
        content: asset.content,
        mediaUrl: asset.mediaUrl,
        status: asset.status,
        createdAt: asset.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error creating campaign asset', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


