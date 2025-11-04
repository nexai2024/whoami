// app/api/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
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
    const { status, planId, cancelAtPeriodEnd, prorate, applyAtPeriodEnd } = body

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

    // If planId is changing and we have a Stripe subscription, update it
    if (planId && planId !== existingSubscription.planId && existingSubscription.stripeSubscriptionId) {
      try {
        // Get the new plan
        const newPlan = await prisma.plan.findUnique({
          where: { id: planId }
        });

        if (!newPlan) {
          return NextResponse.json(
            { error: 'New plan not found' },
            { status: 404 }
          );
        }

        // Get current Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(
          existingSubscription.stripeSubscriptionId
        );

        // Get the subscription item ID
        const subscriptionItemId = stripeSubscription.items.data[0]?.id;
        if (!subscriptionItemId) {
          return NextResponse.json(
            { error: 'Subscription item not found' },
            { status: 404 }
          );
        }

        // Determine if this is an upgrade or downgrade
        const oldPlanTier = getPlanTierFromEnum(existingSubscription.plan.planEnum);
        const newPlanTier = getPlanTierFromEnum(newPlan.planEnum);
        const isUpgrade = newPlanTier > oldPlanTier;

        // For upgrades, apply immediately with proration
        // For downgrades, apply at period end (unless explicitly requested otherwise)
        const shouldProrate = isUpgrade && (prorate !== false);
        const shouldApplyAtPeriodEnd = !isUpgrade && (applyAtPeriodEnd !== false);

        // Update Stripe subscription with new price
        // Create new price data (we'll need to create Stripe prices for each plan)
        // For now, we'll update the subscription item with new price_data
        const updateParams: any = {
          items: [{
            id: subscriptionItemId,
            price_data: {
              currency: 'usd',
              product_data: {
                name: newPlan.name,
                description: newPlan.description || undefined,
              },
              unit_amount: Math.round(Number(newPlan.price) * 100),
              recurring: {
                interval: newPlan.interval as 'month' | 'year',
              },
            },
          }],
          proration_behavior: shouldProrate ? 'create_prorations' : 'none',
        };

        // If downgrade and should apply at period end, set billing_cycle_anchor
        if (shouldApplyAtPeriodEnd) {
          updateParams.billing_cycle_anchor = 'unchanged';
          updateParams.proration_behavior = 'none';
        }

        const updatedStripeSubscription = await stripe.subscriptions.update(
          existingSubscription.stripeSubscriptionId,
          updateParams
        );

        logger.info('Stripe subscription updated', {
          subscriptionId: id,
          oldPlanId: existingSubscription.planId,
          newPlanId: planId,
          prorated: shouldProrate,
          applyAtPeriodEnd: shouldApplyAtPeriodEnd
        });

        // Update local subscription record
        const updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: {
            ...(status && { status }),
            ...(planId && { planId }),
            ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
            ...(shouldProrate && {
              currentPeriodStart: new Date((updatedStripeSubscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((updatedStripeSubscription as any).current_period_end * 1000),
            }),
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
        if (planId) {
          await prisma.profile.update({
            where: { userId },
            data: {
              plan: newPlan.planEnum,
            },
          });
        }

        return NextResponse.json(updatedSubscription);
      } catch (stripeError: any) {
        logger.error('Error updating Stripe subscription:', stripeError);
        return NextResponse.json(
          { error: `Failed to update subscription: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // If just updating status or cancelAtPeriodEnd
    if (existingSubscription.stripeSubscriptionId && (status || cancelAtPeriodEnd !== undefined)) {
      try {
        const updateData: any = {};
        if (cancelAtPeriodEnd !== undefined) {
          if (cancelAtPeriodEnd) {
            await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
              cancel_at_period_end: true,
            });
          } else {
            await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
              cancel_at_period_end: false,
            });
          }
        }

        logger.info('Stripe subscription status updated', {
          subscriptionId: id,
          cancelAtPeriodEnd
        });
      } catch (stripeError: any) {
        logger.error('Error updating Stripe subscription status:', stripeError);
        // Continue with local update even if Stripe update fails
      }
    }

    // Update local subscription record
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(planId && { planId }),
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

// Helper function to get tier from PlanEnum
function getPlanTierFromEnum(planEnum: string): number {
  const tierMap: Record<string, number> = {
    'FREE': 0,
    'CREATOR': 1,
    'PRO': 2,
    'BUSINESS': 3
  };
  return tierMap[planEnum] ?? 0;
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

    // Cancel Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        logger.info('Stripe subscription canceled', {
          subscriptionId: id,
          stripeSubscriptionId: subscription.stripeSubscriptionId
        });
      } catch (stripeError: any) {
        logger.error('Error canceling Stripe subscription:', stripeError);
        // Continue with local deletion even if Stripe cancel fails
      }
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

    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' })
  } catch (error) {
    logger.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}