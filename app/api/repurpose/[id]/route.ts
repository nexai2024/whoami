/**
 * GET /api/repurpose/[id]
 * Get repurposed content with all assets
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

    const repurposedContent = await prisma.repurposedContent.findFirst({
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
      },
    });

    if (!repurposedContent) {
      return NextResponse.json(
        { error: 'Repurposed content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      repurposedContent: {
        id: repurposedContent.id,
        sourceUrl: repurposedContent.sourceUrl,
        sourceType: repurposedContent.sourceType,
        sourceTitle: repurposedContent.sourceTitle,
        transcript: repurposedContent.transcript,
        keyPoints: repurposedContent.keyPoints,
        duration: repurposedContent.duration,
        status: repurposedContent.status,
        error: repurposedContent.error,
        createdAt: repurposedContent.createdAt.toISOString(),
        assets: repurposedContent.assets.map((asset) => ({
          id: asset.id,
          type: asset.type,
          platform: asset.platform,
          content: asset.content,
          mediaUrl: asset.mediaUrl,
          metadata: asset.metadata,
          published: asset.published,
          publishedAt: asset.publishedAt?.toISOString() || null,
          edited: asset.edited,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching repurposed content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
