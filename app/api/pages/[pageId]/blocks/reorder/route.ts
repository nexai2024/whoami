import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

// POST: Reorder blocks for a page
export async function POST(req: NextRequest, { params }: { params: { pageId: string } }) {
  const { pageId } = await params;

  try {
    const body = await req.json();
    const { blocks } = body;

    // Validation
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid blocks data' },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // TODO: Add authentication check
    // Verify user has permission to edit this page
    // if (page.userId !== currentUser.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Update positions in a transaction for atomicity
    await prisma.$transaction(
      blocks.map((block: { id: string; position: number }) =>
        prisma.block.update({
          where: { id: block.id },
          data: { position: block.position },
        })
      )
    );

    logger.info('Blocks reordered successfully:', {
      pageId,
      blockCount: blocks.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Blocks reordered successfully',
    });
  } catch (error) {
    logger.error('Error reordering blocks:', error);

    return NextResponse.json(
      { error: 'Failed to reorder blocks. Please try again.' },
      { status: 500 }
    );
  }
}
