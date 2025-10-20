import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/utils/logger';

// POST: Create payment intent for product purchase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blockId, email } = body;

    // Validation
    if (!blockId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: blockId, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Fetch block data
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true, product: true },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify it's a PRODUCT block
    if (block.type !== 'PRODUCT') {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    // Get product price from block.data or product model
    let productPrice: number;
    let productTitle: string;

    if (block.product) {
      // Price from Product model
      productPrice = block.product.price;
      productTitle = block.product.name;
    } else if (block.data && typeof block.data === 'object' && 'price' in block.data) {
      // Price from block.data JSON
      productPrice = parseFloat(String(block.data.price));
      productTitle = block.title;
    } else {
      return NextResponse.json(
        { error: 'Product price not found' },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(productPrice) || productPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    // Convert price to cents for Stripe (e.g., $49.00 -> 4900)
    const amountInCents = Math.round(productPrice * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        blockId,
        pageId: block.pageId,
        email,
        productTitle,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info('Payment intent created:', {
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      blockId,
      email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents,
      productTitle,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}
