/**
 * POST /api/templates/customizations - Save template customizations
 * GET /api/templates/customizations - Get user's saved customizations
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateId, pageId, customizations, previewData, saved } = body;

    if (!templateId || !customizations) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, customizations' },
        { status: 400 }
      );
    }

    // Create or update customization
    const customization = await prisma.templateCustomization.upsert({
      where: {
        id: `${templateId}-${pageId || 'new'}-${userId}`
      },
      create: {
        templateId,
        pageId: pageId || null,
        userId,
        customizations,
        previewData: previewData || null,
        saved: saved || false
      },
      update: {
        customizations,
        previewData: previewData || null,
        saved: saved || false
      }
    });

    return NextResponse.json({
      customization: {
        ...customization,
        createdAt: customization.createdAt.toISOString(),
        updatedAt: customization.updatedAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving customization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const templateId = searchParams.get('templateId');
    const pageId = searchParams.get('pageId');

    const where: any = { userId };
    if (templateId) where.templateId = templateId;
    if (pageId) where.pageId = pageId;

    const customizations = await prisma.templateCustomization.findMany({
      where,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      customizations: customizations.map((c: any) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching customizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






