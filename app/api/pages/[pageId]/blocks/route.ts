import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Block, BlockType, Prisma } from '@prisma/client';
import { mapBlockType } from '@/lib/blockTypeMapping';
 
// GET: Fetch all blocks for a page
export async function GET(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
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

// POST: Bulk create/update blocks for a page (UPSERT pattern)
export async function POST(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  try {
    const blocks = await req.json();
    logger.info('Saving blocks for page:', pageId, 'Total blocks:', blocks.length);

    // Validate blocks array
    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks must be an array' }, { status: 400 });
    }

    // Use UPSERT pattern: update existing, create new, delete removed
    const results = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get existing block IDs for this page
      const existingBlocks = await tx.block.findMany({
        where: { pageId },
        select: { id: true }
      });
      const existingIds = existingBlocks.map((b: { id: string }) => b.id);

      // Track which IDs were in the submitted blocks
      const submittedIds: string[] = [];
      const processedBlocks = [];

      // Process each block
      for (const [idx, block] of blocks.entries()) {
        try {
          const blockType = mapBlockType(block.type);

          // Prepare block data
          const blockData = {
            type: blockType,
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
          };

          if (block.id) {
            // Check if block exists before updating
            const existingBlock = await tx.block.findUnique({
              where: { id: block.id.toString() }
            });
            
            if (existingBlock) {
              // Update existing block
              submittedIds.push(block.id);
              const updated = await tx.block.update({
                where: { id: block.id.toString() },
                data: blockData
              });
              processedBlocks.push(updated);
            } else {
              // Block ID doesn't exist, create new one
              logger.warn(`Block ID ${block.id} not found, creating new block`);
              const created = await tx.block.create({
                data: {
                  ...blockData,
                  pageId
                }
              });
              processedBlocks.push(created);
            }
          } else {
            // Create new block
            const created = await tx.block.create({
              data: {
                ...blockData,
                pageId
              }
            });
            processedBlocks.push(created);
          }
        } catch (error) {
          logger.error(`Error processing block ${idx} (ID: ${block.id || 'new'}):`, error);
          if (error instanceof Error && error.message.includes('Unknown block type')) {
            throw new Error(`Invalid block type: ${block.type}`);
          }
          throw error;
        }
      }

      // Delete blocks that weren't in submitted list
      const idsToDelete = existingIds.filter((id: string) => !submittedIds.includes(id));
      if (idsToDelete.length > 0) {
        await tx.block.deleteMany({
          where: { id: { in: idsToDelete } }
        });
        logger.info(`Deleted ${idsToDelete.length} removed blocks`);
      }

      return processedBlocks;
    });

    logger.info(`Successfully saved ${results.length} blocks for page ${pageId}`);
    return NextResponse.json(results);
  } catch (error) {
    logger.error('Error saving blocks:', error);
    if (error instanceof Error && error.message.includes('Invalid block type')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save blocks' }, { status: 500 });
  }
}

// DELETE: Remove a block by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
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
