import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/funnels/[id]/analytics
 * Get analytics data for a funnel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const timeframe = request.nextUrl.searchParams.get('timeframe') || '7d';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const funnel = await prisma.funnel.findFirst({
      where: { id, userId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Calculate date filter
    let dateFilter: any = {};
    const now = new Date();
    if (timeframe === '24h') {
      dateFilter = { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    } else if (timeframe === '7d') {
      dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeframe === '30d') {
      dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Get visits in timeframe
    const visits = await prisma.funnelVisit.findMany({
      where: {
        funnelId: id,
        ...(timeframe !== 'all' && { createdAt: dateFilter }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate step analytics
    const stepAnalytics = await Promise.all(
      funnel.steps.map(async (step: { id: any; name: any; order: any; views: any; completions: any; }, index: number) => {
        const stepProgress = await prisma.funnelStepProgress.findMany({
          where: {
            stepId: step.id,
            ...(timeframe !== 'all' && { createdAt: dateFilter }),
          },
        });

        const views = stepProgress.length;
        const completions = stepProgress.filter((p: { status: string; }) => p.status === 'COMPLETED').length;

        // Calculate drop-off
        let dropoffCount = 0;
        let dropoffRate = 0;

        if (index < funnel.steps.length - 1) {
          const nextStep = funnel.steps[index + 1];
          const nextStepProgress = await prisma.funnelStepProgress.count({
            where: {
              stepId: nextStep.id,
              ...(timeframe !== 'all' && { createdAt: dateFilter }),
            },
          });

          dropoffCount = views - nextStepProgress;
          dropoffRate = views > 0 ? (dropoffCount / views) * 100 : 0;
        }

        return {
          id: step.id,
          name: step.name,
          order: step.order,
          views: step.views,
          completions: step.completions,
          dropoffCount,
          dropoffRate,
          conversionRate: views > 0 ? (completions / views) * 100 : 0,
        };
      })
    );

    // Get recent visits with progress
    const recentVisits = visits.slice(0, 20).map((visit: { id: any; email: any; createdAt: { toISOString: () => any; }; completedSteps: string | any[]; converted: any; }) => ({
      id: visit.id,
      email: visit.email,
      createdAt: visit.createdAt.toISOString(),
      completedSteps: visit.completedSteps?.length || 0,
      converted: visit.converted,
    }));

    // Calculate overall conversion rate
    const totalVisits = visits.length || funnel.totalVisits;
    const totalConversions = visits.filter((v: { converted: any; }) => v.converted).length || funnel.totalConversions;
    const conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;

    return NextResponse.json({
      funnel: {
        id: funnel.id,
        name: funnel.name,
        totalVisits,
        totalConversions,
        conversionRate,
      },
      steps: stepAnalytics,
      recentVisits,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
