/**
 * POST /api/campaigns/generate
 * Generate new marketing campaign from product/block using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import {
  GenerateCampaignConfig,
  CampaignRateLimitError,
  generateCampaign,
} from '@/lib/services/campaignService';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, blockId, customContent, config } = body as {
      productId?: string;
      blockId?: string;
      customContent?: {
        title: string;
        description: string;
        imageUrl?: string;
      };
      config?: GenerateCampaignConfig;
    };

    if (!productId && !blockId && !customContent) {
      return NextResponse.json(
        {
          error:
            "Invalid request format. Expected one of: 'productId' (string), 'blockId' (string), or 'customContent' (object with title and description).",
        },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json({ error: 'Missing config' }, { status: 400 });
    }

    const result = await generateCampaign({
      userId,
      productId,
      blockId,
      customContent,
      config,
    });

    return NextResponse.json({
      campaignId: result.campaignId,
      status: result.status,
      estimatedTime: '60-120 seconds',
    });
  } catch (error) {
    logger.error('Error creating campaign', { error });

    if (error instanceof Error) {
      if (error instanceof CampaignRateLimitError) {
        return NextResponse.json(
          {
            error: error.message,
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }

      if (error.message === 'Product not found' || error.message === 'Block not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error.message.startsWith('Invalid request')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
