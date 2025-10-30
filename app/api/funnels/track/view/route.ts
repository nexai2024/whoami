import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/funnels/track/view
 * Track funnel step view
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { funnelId, stepId, visitorId, url, referrer } = body;

    // Get or create visitor session
    let visit = await prisma.funnelVisit.findFirst({
      where: {
        funnelId,
        visitorId,
        converted: false, // Only get active sessions
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!visit) {
      // Create new visit
      visit = await prisma.funnelVisit.create({
        data: {
          funnelId,
          visitorId,
          entryStepId: stepId,
          entryUrl: url,
          referrer,
          currentStepId: stepId,
          completedSteps: [],
        },
      });
    } else {
      // Update existing visit
      await prisma.funnelVisit.update({
        where: { id: visit.id },
        data: {
          currentStepId: stepId,
          lastStepId: visit.currentStepId,
          lastActivityAt: new Date(),
        },
      });
    }

    // Create or update step progress
    const existingProgress = await prisma.funnelStepProgress.findUnique({
      where: {
        visitId_stepId: {
          visitId: visit.id,
          stepId,
        },
      },
    });

    if (!existingProgress) {
      await prisma.funnelStepProgress.create({
        data: {
          visitId: visit.id,
          stepId,
          status: 'VIEWED',
          enteredAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
