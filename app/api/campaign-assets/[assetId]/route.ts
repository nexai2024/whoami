import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    assetId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await params;

    const asset = await prisma.campaignAsset.findFirst({
      where: {
        id: assetId,
        campaign: {
          userId,
        },
      },
      select: {
        id: true,
        campaignId: true,
        type: true,
        platform: true,
        content: true,
        mediaUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    logger.error('Error fetching campaign asset', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



