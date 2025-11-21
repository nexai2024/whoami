import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || '';

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Find existing connected account
    let connected = await prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!connected) {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        metadata: { userId },
      });

      connected = await prisma.stripeConnectedAccount.create({
        data: {
          userId,
          accountId: account.id,
          chargesEnabled: account.charges_enabled || false,
          payoutsEnabled: account.payouts_enabled || false,
          detailsSubmitted: account.details_submitted || false,
          country: account.country || null,
          defaultCurrency: account.default_currency?.toUpperCase() || 'USD',
          businessType: account.business_type || null,
          requirements: account.requirements as any,
        },
      });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: connected.accountId,
      refresh_url: `${origin}/settings/payments?refresh=stripe`,
      return_url: `${origin}/settings/payments?return=stripe`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: connected.accountId,
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 });
  }
}











