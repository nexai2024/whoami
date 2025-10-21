/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, CampaignStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        assets: {
          select: {
            id: true,
            status: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      campaigns: campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        goal: campaign.goal,
        createdAt: campaign.createdAt.toISOString(),
        product: campaign.product,
        assetCount: campaign.assets.length,
        publishedCount: campaign.assets.filter(
          (a) => a.status === 'PUBLISHED'
        ).length,
      })),
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
