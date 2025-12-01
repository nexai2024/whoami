import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/funnels/[id]/leads
 * Get all leads (visits with email) for a funnel
 */
export async function GET(
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

    // Get all visits with email (leads)
    const leads = await prisma.funnelVisit.findMany({
      where: {
        funnelId,
        email: { not: null }, // Only visits with captured email
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        converted: true,
        convertedAt: true,
        conversionValue: true,
        entryStepId: true,
        currentStepId: true,
        completedSteps: true,
        referrer: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        country: true,
        city: true,
        device: true,
      },
    });

    return NextResponse.json({ leads, count: leads.length });
  } catch (error) {
    logger.error('Error fetching funnel leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}



