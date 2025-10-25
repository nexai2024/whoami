/**
 * GET /api/campaigns/[id]
 * Get full campaign with all assets
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        assets: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        product: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        goal: campaign.goal,
        targetAudience: campaign.targetAudience,
        createdAt: campaign.createdAt.toISOString(),
        product: campaign.product
          ? {
              id: campaign.product.id,
              name: campaign.product.name,
              price: campaign.product.price,
            }
          : null,
        assets: campaign.assets.map((asset) => ({
          id: asset.id,
          type: asset.type,
          platform: asset.platform,
          content: asset.content,
          mediaUrl: asset.mediaUrl,
          status: asset.status,
          scheduledAt: asset.scheduledAt?.toISOString() || null,
          publishedAt: asset.publishedAt?.toISOString() || null,
          performance: {
            views: asset.views,
            clicks: asset.clicks,
            conversions: asset.conversions,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
