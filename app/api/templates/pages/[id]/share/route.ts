/**
 * POST /api/templates/pages/[id]/share - Share a template (make it public)
 * PATCH /api/templates/pages/[id]/share - Update sharing settings (price, marketplace visibility)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    // Verify template ownership
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this template' },
        { status: 403 }
      );
    }

    // Make template public
    const updated = await prisma.pageTemplate.update({
      where: { id },
      data: {
        isPublic: true
      }
    });

    return NextResponse.json({
      success: true,
      template: {
        id: updated.id,
        name: updated.name,
        isPublic: updated.isPublic
      }
    });
  } catch (error) {
    console.error('Error sharing template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify template ownership
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this template' },
        { status: 403 }
      );
    }

    // Update sharing settings
    // Note: We'll need to add marketplace fields to schema if not present
    const updated = await prisma.pageTemplate.update({
      where: { id },
      data: {
        isPublic: body.isPublic !== undefined ? body.isPublic : undefined,
        // Add marketplace fields when schema is updated
      }
    });

    return NextResponse.json({
      success: true,
      template: {
        id: updated.id,
        name: updated.name,
        isPublic: updated.isPublic
      }
    });
  } catch (error) {
    console.error('Error updating template sharing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


