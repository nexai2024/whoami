/**
 * POST /api/content/optimizations/[id]/apply - Apply a content optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PageService } from '@/lib/database/pages';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch optimization
    const optimization = await prisma.contentOptimization.findUnique({
      where: { id },
      include: {
        page: true,
        block: true
      }
    });

    if (!optimization || optimization.userId !== userId) {
      return NextResponse.json(
        { error: 'Optimization not found or unauthorized' },
        { status: 404 }
      );
    }

    if (optimization.applied) {
      return NextResponse.json(
        { error: 'Optimization already applied' },
        { status: 400 }
      );
    }

    // Apply optimization based on field
    if (optimization.field === 'metaTitle') {
      await PageService.updatePage(optimization.pageId, {
        metaTitle: optimization.suggestedValue
      });
    } else if (optimization.field === 'metaDescription') {
      await PageService.updatePage(optimization.pageId, {
        metaDescription: optimization.suggestedValue
      });
    } else if (optimization.field === 'metaKeywords') {
      await PageService.updatePage(optimization.pageId, {
        metaKeywords: optimization.suggestedValue
      });
    } else if (optimization.blockId && optimization.field.startsWith('blocks.')) {
      // Update block
      const blockField = optimization.field.split('.').pop();
      if (blockField === 'title') {
        await prisma.block.update({
          where: { id: optimization.blockId },
          data: { title: optimization.suggestedValue }
        });
      } else if (blockField === 'description') {
        await prisma.block.update({
          where: { id: optimization.blockId },
          data: { description: optimization.suggestedValue }
        });
      }
    }

    // Mark as applied
    await prisma.contentOptimization.update({
      where: { id },
      data: {
        applied: true,
        appliedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Optimization applied successfully'
    });
  } catch (error) {
    console.error('Error applying optimization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






