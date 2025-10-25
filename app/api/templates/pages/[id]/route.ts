/**
 * GET /api/templates/pages/[id] - Get single template details
 * PATCH /api/templates/pages/[id] - Update template (owner only)
 * DELETE /api/templates/pages/[id] - Delete template (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userId = request.headers.get('x-user-id');

    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check visibility
    if (!template.isPublic && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        templateType: template.templateType,
        headerData: template.headerData,
        blocksData: template.blocksData,
        thumbnailUrl: template.thumbnailUrl,
        previewUrl: template.previewUrl,
        useCount: template.useCount,
        featured: template.featured,
        isPublic: template.isPublic,
        userId: template.userId,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        author: template.user ? {
          username: template.user.profile?.username,
          displayName: template.user.profile?.displayName
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { id } = params;

    // Check ownership
    const existingTemplate = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only update your own templates' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate headerStyle if headerData is being updated
    if (body.headerData) {
      if (!body.headerData.headerStyle || !['minimal', 'card', 'gradient', 'split'].includes(body.headerData.headerStyle)) {
        return NextResponse.json(
          { error: 'Invalid or missing headerStyle in headerData' },
          { status: 400 }
        );
      }
    }

    // Validate templateType if provided
    if (body.templateType && !['BIO_ONLY', 'FULL_PAGE'].includes(body.templateType)) {
      return NextResponse.json(
        { error: 'Invalid templateType. Must be BIO_ONLY or FULL_PAGE' },
        { status: 400 }
      );
    }

    // Update template (users can't change featured status)
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category) updateData.category = body.category;
    if (body.tags) updateData.tags = body.tags;
    if (body.templateType) updateData.templateType = body.templateType;
    if (body.headerData) updateData.headerData = body.headerData;
    if (body.blocksData) updateData.blocksData = body.blocksData;
    if (body.thumbnailUrl) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.previewUrl !== undefined) updateData.previewUrl = body.previewUrl;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    const template = await prisma.pageTemplate.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = params;

    // Check ownership
    const existingTemplate = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { userId: true, featured: true }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only delete your own templates' },
        { status: 403 }
      );
    }

    // Prevent deletion of featured templates
    if (existingTemplate.featured) {
      return NextResponse.json(
        { error: 'Cannot delete featured templates' },
        { status: 403 }
      );
    }

    await prisma.pageTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
