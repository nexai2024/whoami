/**
 * POST /api/templates/pages/[id]/use - Apply template to user's page
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json(
        { error: 'Missing required field: pageId' },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await prisma.pageTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check template visibility
    if (!template.isPublic && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied to this template' },
        { status: 403 }
      );
    }

    // Verify page ownership
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { userId: true }
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    if (page.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only modify your own pages' },
        { status: 403 }
      );
    }

    // Apply template to page in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create page header
      const headerData = template.headerData as any;

      await tx.pageHeader.upsert({
        where: { pageId },
        create: {
          pageId,
          data: headerData
        },
        update: {
          data: headerData
        }
      });

      // For FULL_PAGE templates, replace blocks
      if (template.templateType === 'FULL_PAGE') {
        const blocksData = template.blocksData as any[];
console.log('blocksData', blocksData);
        // Delete existing blocks
        await tx.block.deleteMany({
          where: { pageId }
        });

        // Create new blocks from template
        if (Array.isArray(blocksData) && blocksData.length > 0) {
          await tx.block.createMany({
            data: blocksData.map((block: any) => ({
              pageId,
              type: block.type,
              position: block.position,
              title: block.title,
              description: block.description || null,
              url: block.url || null,
              imageUrl: block.imageUrl || null,
              backgroundColor: block.backgroundColor || '#ffffff',
              textColor: block.textColor || '#000000',
              borderRadius: block.borderRadius || 8,
              data: block.data || {},
              isActive: true
            }))
          });
        }
      }

      // Increment template use count
      await tx.pageTemplate.update({
        where: { id },
        data: {
          useCount: {
            increment: 1
          }
        }
      });

      return true;
    });

    return NextResponse.json({
      success: true,
      message: 'Template applied successfully',
      templateType: template.templateType
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
