import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

// GET: Fetch a single block by ID
export async function GET(req: NextRequest, { params }: { params: { blockId: string } }) {
  const { blockId } = await params;

  try {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        product: true,
        page: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(block);
  } catch (error) {
    logger.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch block' },
      { status: 500 }
    );
  }
}
