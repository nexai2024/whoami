import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

type CreatePaymentIntentParams = {
  amountInCents: number;
  currency: string;
  blockId: string;
  pageId?: string | null;
  email: string;
  productTitle?: string;
  sellerUserId?: string | null;
};

/**
 * Feature-flagged payments helper. Supports:
 * - Platform-owned charges (no Connect)
 * - Connect destination charges (platform collects application fee, net to creator)
 */
export async function createFeatureFlaggedPaymentIntent(params: CreatePaymentIntentParams) {
  const {
    amountInCents,
    currency,
    blockId,
    pageId,
    email,
    productTitle,
    sellerUserId,
  } = params;

  const mode = (process.env.STRIPE_MODE || 'platform').toLowerCase(); // 'platform' | 'connect'
  const defaultFeePercent =
    typeof process.env.STRIPE_APP_FEE_PERCENT !== 'undefined'
      ? Number(process.env.STRIPE_APP_FEE_PERCENT)
      : 10; // default 10%

  let metadata: Record<string, string> = {
    blockId,
    pageId: pageId || '',
    email,
    productTitle: productTitle || '',
  };

  if (mode !== 'connect' || !sellerUserId) {
    // Simple platform-owned PaymentIntent
    return stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  // Try to find connected account for seller
  const connected = await prisma.stripeConnectedAccount.findUnique({
    where: { userId: sellerUserId },
  });

  if (!connected || !connected.accountId || !connected.chargesEnabled) {
    // Fallback to platform charge if no connected account or not enabled
    return stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        ...metadata,
        connectMode: 'fallback_platform_no_connected_account',
      },
      automatic_payment_methods: { enabled: true },
    });
  }

  // Determine application fee
  const feePercent = typeof connected.applicationFeePercent === 'number'
    ? connected.applicationFeePercent
    : defaultFeePercent;

  const applicationFeeAmount = Math.max(
    0,
    Math.floor((amountInCents * feePercent) / 100)
  );

  // Encode connect context in metadata for webhook reconciliation
  metadata = {
    ...metadata,
    connectMode: 'destination_charge',
    connectedAccountId: connected.accountId,
    sellerUserId: sellerUserId,
    applicationFeeAmount: String(applicationFeeAmount),
    feePercent: String(feePercent),
  };

  // Create a destination charge: charge on platform, transfer net to connected account
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    automatic_payment_methods: { enabled: true },
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: connected.accountId,
    },
    metadata,
  });
}

export function centsFromAmount(amount: number): number {
  return Math.max(0, Math.round(amount * 100));
}









