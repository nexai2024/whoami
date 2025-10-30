import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/funnels/track/interaction
 * Track user interactions (CTA clicks, video views, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { funnelId, stepId, visitorId, action, data } = body;

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
          status: 'ENGAGED',
          ctaClicked: action === 'cta_click' ? true : progress.ctaClicked,
          interactions: {
            ...(progress.interactions as any),
            [action]: data || new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
