import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Block, BlockType } from '@prisma/client';
 
// GET: Fetch all blocks for a page
export async function GET(req: NextRequest, { params }: { params: { pageId: string } }) {
  const { pageId } = await params;
  try {
    const blocks = await prisma.block.findMany({
      where: { pageId },
      orderBy: { position: 'asc' }
    });
    return NextResponse.json(blocks);
  } catch (error) {
    logger.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}

// POST: Bulk create/update blocks for a page
export async function POST(req: NextRequest, { params }: { params: { pageId: string } }) {
  const { pageId } = await params;
  try {
    const blocks = await req.json();
    logger.error("these are the blocks", blocks)
    // Remove all existing blocks for this page (simple approach)
    await prisma.block.deleteMany({ where: { pageId } });
    // Create new blocks
    const createdBlocks = await prisma.$transaction(
      blocks.map((block: BlockSelectCreateManyAndReturn, idx: number) =>
        prisma.block.create({
          data: {
            pageId,
            type: 'PRODUCT', 
            position: idx,
            isActive: block.isActive !== false,
            title: block.title,
            description: block.description || null,
            url: block.url || null,
            imageUrl: block.imageUrl || null,
            backgroundColor: block.backgroundColor || null,
            textColor: block.textColor || null,
            borderRadius: block.borderRadius || 8,
            data: block.data || {},
            scheduledStart: block.scheduledStart || null,
            scheduledEnd: block.scheduledEnd || null,
            variantId: block.variantId || null,
            // productId: block.productId || null,
            // analyticsId: block.analyticsId || null,
            // formId: block.formId || null,
          }
        })
      )
    );
    return NextResponse.json(createdBlocks);
  } catch (error) {
    logger.error('Error saving blocks:', error);
    return NextResponse.json({ error: 'Failed to save blocks' }, { status: 500 });
  }
}

// DELETE: Remove a block by ID
export async function DELETE(req: NextRequest, { params }: { params: { pageId: string } }) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get('blockId');
  if (!blockId) {
    return NextResponse.json({ error: 'Missing blockId' }, { status: 400 });
  }
  try {
    await prisma.block.delete({ where: { id: blockId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting block:', error);
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
