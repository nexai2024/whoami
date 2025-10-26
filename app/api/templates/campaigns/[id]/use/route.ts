/**
 * POST /api/templates/campaigns/[id]/use - Use template to start campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
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
    const template = await prisma.campaignTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isPublic && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Increment use count
    await prisma.campaignTemplate.update({
      where: { id: template.id },
      data: { useCount: template.useCount + 1 }
    });

    // Return template data for campaign wizard
    return NextResponse.json({
      goal: template.goal,
      targetAudience: template.targetAudience,
      platforms: template.platforms,
      tone: template.tone,
      message: 'Template loaded successfully'
    });
  } catch (error) {
    console.error('Error using campaign template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
