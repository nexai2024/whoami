// app/api/admin/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// GET /api/admin/plans - List all plans (including inactive)
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const plans = await prisma.plan.findMany({
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
      orderBy: [
        { planEnum: 'asc' },
        { name: 'asc' },
      ],
    });

    // Add displayName to features
    const plansWithDisplayNames = plans.map((plan: any) => ({
      ...plan,
      features: plan.features.map((pf: any) => ({
        ...pf,
        feature: {
          ...pf.feature,
          displayName: pf.feature.description || pf.feature.name
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
      }))
    }));

    return NextResponse.json(plansWithDisplayNames);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, planEnum, price, interval, isActive } = body;

    if (!name || !planEnum || price === undefined || !interval) {
      return NextResponse.json(
        { error: 'Name, planEnum, price, and interval are required' },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description: description || null,
        planEnum,
        price: parseFloat(price),
        interval,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Plan with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

