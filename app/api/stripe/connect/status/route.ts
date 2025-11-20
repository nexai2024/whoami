import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const connected = await prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    });

    if (!connected) {
      return NextResponse.json({ connected: false });
    }

    // Refresh from Stripe for latest status
    const acct = await stripe.accounts.retrieve(connected.accountId);

    // Update local cache
    await prisma.stripeConnectedAccount.update({
      where: { userId },
      data: {
        chargesEnabled: acct.charges_enabled || false,
        payoutsEnabled: acct.payouts_enabled || false,
        detailsSubmitted: acct.details_submitted || false,
        country: acct.country || null,
        defaultCurrency: acct.default_currency?.toUpperCase() || 'USD',
        businessType: acct.business_type || null,
        requirements: acct.requirements as any,
      },
    });

    return NextResponse.json({
      connected: true,
      accountId: connected.accountId,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
      detailsSubmitted: acct.details_submitted,
      requirementsDue: acct.requirements?.currently_due || [],
    });
  } catch (error) {
    console.error('Stripe Connect status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}









