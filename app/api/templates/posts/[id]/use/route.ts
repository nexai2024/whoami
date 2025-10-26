/**
 * POST /api/templates/posts/[id]/use - Use template to create scheduled post
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
    const template = await prisma.postTemplate.findUnique({
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

    // Return template data for user to schedule
    // Actual post creation happens in the scheduler
    await prisma.postTemplate.update({
      where: { id: template.id },
      data: { useCount: template.useCount + 1 }
    });

    return NextResponse.json({
      content: template.content,
      platform: template.platform,
      postType: template.postType,
      mediaUrls: template.mediaUrls,
      message: 'Template loaded successfully'
    });
  } catch (error) {
    console.error('Error using post template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
