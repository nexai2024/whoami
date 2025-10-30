import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/funnels/[id] - Get single funnel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const funnel = await prisma.funnel.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            visits: true,
            conversions: true,
          },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel' },
      { status: 500 }
    );
  }
}

// PATCH /api/funnels/[id] - Update funnel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      slug,
      goalType,
      goalValue,
      conversionGoal,
      theme,
      brandColors,
      status,
      exitRedirect,
      metaTitle,
      metaDescription,
      ogImage,
    } = body;

    // Verify ownership
    const existing = await prisma.funnel.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // If slug is changing, check uniqueness
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.funnel.findUnique({
        where: { slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    const funnel = await prisma.funnel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(slug && { slug }),
        ...(goalType && { goalType }),
        ...(goalValue !== undefined && { goalValue }),
        ...(conversionGoal && { conversionGoal }),
        ...(theme && { theme }),
        ...(brandColors && { brandColors }),
        ...(status && {
          status,
          ...(status === 'ACTIVE' && !existing.publishedAt && {
            publishedAt: new Date(),
          }),
        }),
        ...(exitRedirect !== undefined && { exitRedirect }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(ogImage !== undefined && { ogImage }),
      },
    });

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Error updating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to update funnel' },
      { status: 500 }
    );
  }
}

// DELETE /api/funnels/[id] - Delete funnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.funnel.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    await prisma.funnel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { error: 'Failed to delete funnel' },
      { status: 500 }
    );
  }
}
