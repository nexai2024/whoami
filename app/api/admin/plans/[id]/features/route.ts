// app/api/admin/plans/[id]/features/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// POST /api/admin/plans/[id]/features - Add a feature to a plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const { id: planId } = await params;
    const body = await request.json();
    const { featureId, enabled, limit, rateLimit, ratePeriod } = body;

    if (!featureId) {
      return NextResponse.json(
        { error: 'featureId is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if feature exists
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    // Create or update plan feature
    const planFeature = await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId,
          featureId,
        },
      },
      update: {
        enabled: enabled !== undefined ? enabled : true,
        limit: limit !== undefined ? (limit === null || limit === '' ? null : parseInt(limit)) : null,
        rateLimit: rateLimit !== undefined ? (rateLimit === null || rateLimit === '' ? null : parseInt(rateLimit)) : null,
        ratePeriod: ratePeriod || null,
      },
      create: {
        planId,
        featureId,
        enabled: enabled !== undefined ? enabled : true,
        limit: limit !== undefined ? (limit === null || limit === '' ? null : parseInt(limit)) : null,
        rateLimit: rateLimit !== undefined ? (rateLimit === null || rateLimit === '' ? null : parseInt(rateLimit)) : null,
        ratePeriod: ratePeriod || null,
      },
      include: {
        feature: true,
      },
    });

    return NextResponse.json(planFeature);
  } catch (error: any) {
    console.error('Error adding feature to plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


