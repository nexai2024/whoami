import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/billing/invoices
 * Fetch billing history (invoices) from Stripe
 */
export async function GET(request: NextRequest) {
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
      // No Stripe customer yet, return empty invoices
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: profile.stripeCustomerId,
      limit: 100, // Get last 100 invoices
    });

    // Transform Stripe invoices to a simpler format
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents to dollars
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      date: new Date(invoice.created * 1000).toISOString(),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      description: invoice.description || invoice.lines.data[0]?.description || 'Subscription',
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      subscriptionId: (invoice as any).subscription as string | null,
    }));

    logger.info('Billing history fetched', {
      userId,
      invoiceCount: formattedInvoices.length,
    });

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    logger.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
