/**
 * GET /api/blocks - List all blocks for authenticated user
 * Enables campaign wizard to use blocks as campaign source
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, BlockType } from '@prisma/client';

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
    const pageId = searchParams.get('pageId');
    const type = searchParams.get('type') as BlockType | null;
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause - filter by user's pages
    const where: any = {
      page: {
        userId
      }
    };

    // Add optional filters
    if (pageId) {
      where.pageId = pageId;
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    } else {
      // Default to active blocks only for campaign wizard use case
      where.isActive = true;
    }

    // Get blocks with page info and click count
    const [blocks, total] = await Promise.all([
      prisma.block.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          page: {
            select: {
              title: true,
              slug: true
            }
          },
          _count: {
            select: { clicks: true }
          }
        }
      }),
      prisma.block.count({ where })
    ]);

    return NextResponse.json({
      blocks: blocks.map(block => ({
        id: block.id,
        pageId: block.pageId,
        type: block.type,
        title: block.title,
        description: block.description,
        url: block.url,
        imageUrl: block.imageUrl,
        isActive: block.isActive,
        position: block.position,
        data: block.data,
        createdAt: block.createdAt.toISOString(),
        updatedAt: block.updatedAt.toISOString(),
        pageName: block.page.title,
        pageSlug: block.page.slug,
        clickCount: block._count.clicks
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
