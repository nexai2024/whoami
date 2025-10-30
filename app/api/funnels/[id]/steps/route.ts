import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/funnels/[id]/steps - Create new step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: funnelId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify funnel ownership
    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, userId },
      include: { steps: true },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      type,
      order,
      headline,
      subheadline,
      content,
      pageData,
      backgroundImage,
      videoUrl,
      ctaText,
      ctaUrl,
      formConfig,
    } = body;

    // Validate required fields
    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is unique within funnel
    const existing = funnel.steps.find((s: { slug: string; }) => s.slug === slug);
    if (existing) {
      return NextResponse.json(
        { error: 'Step slug already exists in this funnel' },
        { status: 409 }
      );
    }

    // If order not specified, add to end
    const maxOrder =
      funnel.steps.length > 0
        ? Math.max(...funnel.steps.map((s: { order: number; }) => s.order))
        : -1;
    const stepOrder = order !== undefined ? order : maxOrder + 1;

    const step = await prisma.funnelStep.create({
      data: {
        funnelId,
        name,
        slug,
        type,
        order: stepOrder,
        headline,
        subheadline,
        content,
        pageData: pageData || {},
        backgroundImage,
        videoUrl,
        ctaText,
        ctaUrl,
        formConfig: formConfig || {},
      },
    });

    return NextResponse.json({ step }, { status: 201 });
  } catch (error) {
    console.error('Error creating funnel step:', error);
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    );
  }
}

// PATCH /api/funnels/[id]/steps - Reorder steps
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: funnelId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify funnel ownership
    const funnel = await prisma.funnel.findFirst({
      where: { id: funnelId, userId },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const body = await request.json();
    const { stepOrders } = body; // Array of { id, order }

    if (!Array.isArray(stepOrders)) {
      return NextResponse.json(
        { error: 'stepOrders must be an array' },
        { status: 400 }
      );
    }

    // Update all step orders
    await Promise.all(
      stepOrders.map((item: { id: string; order: number; }) =>
        prisma.funnelStep.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const steps = await prisma.funnelStep.findMany({
      where: { funnelId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Error reordering steps:', error);
    return NextResponse.json(
      { error: 'Failed to reorder steps' },
      { status: 500 }
    );
  }
}
