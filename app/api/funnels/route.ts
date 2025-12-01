import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkFeatureGate, checkQuotaGate } from '@/lib/gating/contentGate';

// GET /api/funnels - List all funnels for user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');

    const funnels = await prisma.funnel.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            order: true,
            views: true,
            completions: true,
          },
        },
        _count: {
          select: {
            visits: true,
            conversions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add leads count for each funnel
    const funnelsWithLeads = await Promise.all(
      funnels.map(async (funnel : any) => {
        const leadsCount = await prisma.funnelVisit.count({
          where: {
            funnelId: funnel.id,
            email: { not: null },
          },
        });
        return {
          ...funnel,
          leadsCount,
        };
      })
    );

    return NextResponse.json({ funnels: funnelsWithLeads });
  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: 500 }
    );
  }
}

// POST /api/funnels - Create new funnel
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check feature access
    const featureGate = await checkFeatureGate(userId, 'funnels', false);
    if (!featureGate.allowed) {
      return featureGate.response || NextResponse.json(
        { error: 'Funnels are not available in your plan' },
        { status: 403 }
      );
    }

    // Check current funnel count and quota
    const currentFunnelCount = await prisma.funnel.count({
      where: { userId },
    });

    const quotaGate = await checkQuotaGate(userId, 'funnels', currentFunnelCount);
    if (!quotaGate.allowed) {
      return quotaGate.response || NextResponse.json(
        { error: 'You have reached your funnel limit' },
        { status: 403 }
      );
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
    } = body;

    // Validate required fields
    if (!name || !slug || !goalType || !conversionGoal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existing = await prisma.funnel.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const funnel = await prisma.funnel.create({
      data: {
        userId,
        name,
        description,
        slug,
        goalType,
        goalValue,
        conversionGoal,
        theme: theme || {},
        brandColors: brandColors || {},
        status: 'DRAFT',
      },
    });

    // Record usage after successful creation
    try {
      const { recordUsage } = await import('@/lib/utils/usageTracker');
      await recordUsage(userId, 'funnels', 1);
    } catch (error) {
      console.error('Error recording funnel usage:', error);
      // Don't fail the request if usage tracking fails
    }

    return NextResponse.json({ funnel }, { status: 201 });
  } catch (error) {
    console.error('Error creating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to create funnel' },
      { status: 500 }
    );
  }
}
