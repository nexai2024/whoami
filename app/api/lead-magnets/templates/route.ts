/**
 * GET /api/lead-magnets/templates
 * Get available lead magnet templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TemplateCategory, MagnetType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as TemplateCategory | null;
    const type = searchParams.get('type') as MagnetType | null;
    const featured = searchParams.get('featured') === 'true';

    const templates = await prisma.leadMagnetTemplate.findMany({
      where: {
        ...(category && { category }),
        ...(type && { type }),
        ...(featured && { featured: true }),
      },
      orderBy: [
        { featured: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      templates: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        type: template.type,
        thumbnailUrl: template.thumbnailUrl,
        previewUrl: template.previewUrl,
        useCount: template.useCount,
        featured: template.featured,
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
