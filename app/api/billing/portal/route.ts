import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/billing/portal
 * Create a Stripe customer portal session
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile and Stripe customer ID
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get base URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${origin}/settings/billing`,
    });

    logger.info('Stripe portal session created', {
      sessionId: portalSession.id,
      userId,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    logger.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
