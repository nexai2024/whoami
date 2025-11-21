// app/api/admin/plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// GET /api/admin/plans/[id] - Get a single plan
export async function GET(
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

    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Add displayName to features
    const planWithDisplayNames = {
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
    };

    return NextResponse.json(planWithDisplayNames);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/plans/[id] - Update a plan
export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, planEnum, price, interval, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (planEnum !== undefined) updateData.planEnum = planEnum;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (interval !== undefined) updateData.interval = interval;
    if (isActive !== undefined) updateData.isActive = isActive;

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    // Add displayName to features
    const planWithDisplayNames = {
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
    };

    return NextResponse.json(planWithDisplayNames);
  } catch (error: any) {
    console.error('Error updating plan:', error);
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

// DELETE /api/admin/plans/[id] - Delete a plan
export async function DELETE(
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

    const { id } = await params;
    
    // Check if plan has active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { planId: id, status: 'active' },
    });

    if (subscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

