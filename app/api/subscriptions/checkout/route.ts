import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/subscriptions/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { planId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Plan not found or inactive' },
        { status: 404 }
      );
    }

    // Get or create user profile
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create a basic profile if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Generate username
      const email = user.email;
      const baseUsername = email.split('@')[0].toLowerCase().substring(0, 20);
      let username = baseUsername;
      let counter = 1;

      while (await prisma.profile.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      profile = await prisma.profile.create({
        data: {
          userId,
          username,
          plan: 'FREE',
        },
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      // Get user email for Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        metadata: {
          userId: userId,
        },
      });

      stripeCustomerId = customer.id;

      // Update profile with Stripe customer ID
      await prisma.profile.update({
        where: { userId },
        data: { stripeCustomerId },
      });
    }

    // Get base URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(Number(plan.price) * 100), // Convert to cents
            recurring: {
              interval: plan.interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/settings/billing?canceled=true`,
      metadata: {
        userId,
        planId: plan.id,
      },
    });

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      userId,
      planId,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
