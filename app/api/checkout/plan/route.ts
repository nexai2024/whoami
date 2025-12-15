import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

// POST /api/checkout/plan
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { planId, priceId } = await request.json();
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan from database to retrieve priceId
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Plan does not have a Stripe price ID configured' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId;
    
    // Check if user already has a Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true }
    });

    if (subscription?.stripeCustomerId) {
      stripeCustomerId = subscription.stripeCustomerId;
      console.log("Stripe customer already exists", stripeCustomerId);
    } else {
      // Get user email from Stack Auth or Profile
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { userId: true }  
      });
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        metadata: {
          userId: userId,
          planId: planId
        }
      });

      stripeCustomerId = customer.id;
      console.log("Stripe customer created", stripeCustomerId);
      // Update or create subscription record with customer 
      //the subscription table will con default free plan, do we overwrite  it?  No, we should not overwrite it. Create a new subscription record.
      
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: userId,
          planId: planId,
          status: 'incomplete',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          stripeCustomerId: customer.id,
          priceId: priceId,
          stripeSubscriptionId: planId
        }
      });
      console.log("New subscription created", newSubscription);
      
      // await prisma.subscription.upsert({
      //   where: { userId },
      //   update: {
      //     stripeCustomerId: customer.id,
      //     priceId: priceId,
      //     stripeSubscriptionId: planId,
      //    planId: planId,
      //     status: 'incomplete',
      //     currentPeriodStart: new Date(),
      //     currentPeriodEnd: new Date(),
      //   },
      //   create: {
      //     userId: userId,
      //     planId: planId,
      //     status: 'incomplete',
      //     currentPeriodStart: new Date(),
      //     currentPeriodEnd: new Date(),
      //     stripeCustomerId: customer.id
      //   }
      // });
    }

    const domainURL = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          //price: plan.priceId,
          price: 'price_1See07GlVhQiVMeg5t46NB63',
          quantity: 1,
        },
      ],
      success_url: `${domainURL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
          planName: plan.name
        }
      }
    });

    logger.info('Checkout session created', {
      sessionId: session.id,
      userId,
      planId,
      planName: plan.name
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}