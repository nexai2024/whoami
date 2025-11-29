// app/api/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

// PATCH /api/subscriptions/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json()
    const { status, planId, cancelAtPeriodEnd } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        user: true
      }
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingSubscription.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If planId is changing, validate new plan
    if (planId && planId !== existingSubscription.planId) {
      const newPlan = await prisma.plan.findUnique({
        where: { id: planId }
      });

      if (!newPlan) {
        return NextResponse.json(
          { error: 'New plan not found' },
          { status: 404 }
        );
      }

      // Prevent non-super admins from upgrading to super admin plans
      const { isSuperAdminPlan, isSuperAdmin } = await import('@/lib/utils/adminUtils');
      if (isSuperAdminPlan(newPlan)) {
        const userIsSuperAdmin = await isSuperAdmin(userId);
        if (!userIsSuperAdmin) {
          return NextResponse.json(
            { error: 'This plan cannot be purchased. It must be assigned by a super admin.' },
            { status: 403 }
          );
        }
      }

      // Update local subscription record
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          planId,
          ...(status && { status }),
          ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
        },
        include: {
          plan: {
            include: {
              features: {
                include: {
                  feature: true,
                },
              },
            },
          },
        },
      });

      // Update Profile with new plan
      await prisma.profile.update({
        where: { userId },
        data: {
          plan: newPlan.planEnum,
        },
      });

      logger.info('Subscription updated', {
        subscriptionId: id,
        oldPlanId: existingSubscription.planId,
        newPlanId: planId,
      });

      return NextResponse.json(updatedSubscription);
    }

    // Update local subscription record for status/cancel changes
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    logger.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (subscription.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get FREE plan
    const freePlan = await prisma.plan.findFirst({
      where: { planEnum: 'FREE' }
    });

    // Update Profile to FREE
    if (freePlan) {
      await prisma.profile.update({
        where: { userId },
        data: {
          plan: 'FREE',
          subscriptionStatus: 'canceled',
          subscriptionId: null,
        },
      });
    }

    // Delete local subscription record
    await prisma.subscription.delete({
      where: { id },
    })

    logger.info('Subscription canceled', {
      subscriptionId: id,
      userId,
    });

    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' })
  } catch (error) {
    logger.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
