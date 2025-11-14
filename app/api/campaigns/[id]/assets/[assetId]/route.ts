/**
 * PUT /api/campaigns/[id]/assets/[assetId]
 * Update an existing campaign asset
 * 
 * DELETE /api/campaigns/[id]/assets/[assetId]
 * Delete a campaign asset
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import prisma from '@/lib/prisma';
import { AssetType, Platform, AssetStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    id: string;
    assetId: string;
  }>;
}

export async function PUT(
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

    const { id: campaignId, assetId } = await params;
    const body = await request.json();

    const { type, platform, content, mediaUrl, status } = body as {
      type?: AssetType;
      platform?: Platform | null;
      content?: string;
      mediaUrl?: string | null;
      status?: AssetStatus;
    };

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

    // Verify asset exists and belongs to campaign
    const existingAsset = await prisma.campaignAsset.findFirst({
      where: {
        id: assetId,
        campaignId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update the asset
    const asset = await prisma.campaignAsset.update({
      where: { id: assetId },
      data: {
        ...(type !== undefined && { type }),
        ...(platform !== undefined && { platform }),
        ...(content !== undefined && { content }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      asset: {
        id: asset.id,
        type: asset.type,
        platform: asset.platform,
        content: asset.content,
        mediaUrl: asset.mediaUrl,
        status: asset.status,
        updatedAt: asset.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating campaign asset', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id: campaignId, assetId } = await params;

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

    // Verify asset exists and belongs to campaign
    const existingAsset = await prisma.campaignAsset.findFirst({
      where: {
        id: assetId,
        campaignId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete the asset
    await prisma.campaignAsset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting campaign asset', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


