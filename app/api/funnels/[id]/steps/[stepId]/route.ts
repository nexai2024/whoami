import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/funnels/[id]/steps/[stepId] - Update step
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: funnelId, stepId } = await params;
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

    const step = await prisma.funnelStep.update({
      where: { id: stepId, funnelId },
      data: body,
    });

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Error updating step:', error);
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    );
  }
}

// DELETE /api/funnels/[id]/steps/[stepId] - Delete step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id: funnelId, stepId } = await params;
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

    await prisma.funnelStep.delete({
      where: { id: stepId, funnelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting step:', error);
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    );
  }
}
