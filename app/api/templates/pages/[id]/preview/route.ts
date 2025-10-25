/**
 * GET /api/templates/pages/[id]/preview - Get template preview data
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
      select: {
        id: true,
        name: true,
        templateType: true,
        headerData: true,
        blocksData: true,
        isPublic: true,
        userId: true
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

    // Return template data in preview-ready format
    return NextResponse.json({
      preview: {
        id: template.id,
        name: template.name,
        templateType: template.templateType,
        header: template.headerData,
        blocks: template.blocksData || []
      }
    });
  } catch (error) {
    console.error('Error fetching template preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
