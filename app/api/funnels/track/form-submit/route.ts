import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/funnels/track/form-submit
 * Track form submissions and lead captures
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { funnelId, stepId, visitorId, formData } = body;

    // Find the visit
    const visit = await prisma.funnelVisit.findFirst({
      where: {
        funnelId,
        visitorId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Update visit with captured info
    await prisma.funnelVisit.update({
      where: { id: visit.id },
      data: {
        email: formData.email,
        name: formData.name,
        completedSteps: [...(visit.completedSteps || []), stepId],
      },
    });

    // Update step progress
    const progress = await prisma.funnelStepProgress.findUnique({
      where: {
        visitId_stepId: {
          visitId: visit.id,
          stepId,
        },
      },
    });

    if (progress) {
      await prisma.funnelStepProgress.update({
        where: { id: progress.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          formData,
        },
      });

      // Increment step completion count
      await prisma.funnelStep.update({
        where: { id: stepId },
        data: { completions: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking form submit:', error);
    return NextResponse.json(
      { error: 'Failed to track form submission' },
      { status: 500 }
    );
  }
}
