/**
 * GET /api/templates/products/[id] - Get single product template
 * POST /api/templates/products/[id]/use - Use template to create product
 * DELETE /api/templates/products/[id] - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const template = await prisma.productTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check access: must be public or owned by user
    if (!template.isPublic && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      description: template.description,
      price: template.price,
      currency: template.currency,
      downloadLimit: template.downloadLimit,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      useCount: template.useCount,
      featured: template.featured,
      isPublic: template.isPublic,
      createdAt: template.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching product template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const template = await prisma.productTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Only owner can delete
    if (template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.productTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
