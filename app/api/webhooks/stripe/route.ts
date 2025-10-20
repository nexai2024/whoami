import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    logger.error('Webhook error: No signature');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.error('Error processing webhook:', err);
    // Still return 200 to Stripe so it doesn't retry
    return NextResponse.json({ received: true, error: err.message });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Payment intent succeeded:', paymentIntent.id);

  const { blockId, pageId, email, productTitle } = paymentIntent.metadata;

  if (!blockId || !email) {
    logger.error('Missing metadata in payment intent:', paymentIntent.id);
    return;
  }

  try {
    // Check if sale already exists (prevent duplicates from webhook retries)
    const existingSale = await prisma.sale.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingSale) {
      logger.info('Sale already recorded:', paymentIntent.id);
      return;
    }

    // Get block to find productId
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { productId: true },
    });

    // Create sale record
    const sale = await prisma.sale.create({
      data: {
        productId: block?.productId || blockId, // Use productId if available, fallback to blockId
        buyerEmail: email,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        currency: paymentIntent.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: 'completed',
      },
    });

    logger.info('Sale recorded successfully:', {
      saleId: sale.id,
      paymentIntentId: paymentIntent.id,
      amount: sale.amount,
      email,
    });

    // TODO: Send confirmation email to buyer (future enhancement)
  } catch (err) {
    logger.error('Error creating sale record:', err);
    throw err;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.warn('Payment intent failed:', {
    id: paymentIntent.id,
    email: paymentIntent.metadata.email,
    error: paymentIntent.last_payment_error?.message,
  });

  // TODO: Send failure notification email (future enhancement)
}
