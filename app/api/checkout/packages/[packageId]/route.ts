/**
 * POST /api/checkout/packages/[packageId]
 * Create checkout session for a package (bundle of products)
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { email, name } = body;

    // Get package
    const packageProduct = await prisma.product.findUnique({
      where: { id: packageId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!packageProduct) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    if (packageProduct.type !== 'PACKAGE') {
      return NextResponse.json(
        { error: 'Product is not a package' },
        { status: 400 }
      );
    }

    if (!packageProduct.isActive) {
      return NextResponse.json(
        { error: 'Package is not available' },
        { status: 400 }
      );
    }

    // Get included products
    const includedProducts = await prisma.product.findMany({
      where: {
        id: { in: packageProduct.packageProducts || [] },
        isActive: true
      }
    });

    if (includedProducts.length === 0) {
      return NextResponse.json(
        { error: 'Package has no products' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const origin = request.headers.get('origin') || 
                   process.env.NEXT_PUBLIC_BASE_URL || 
                   'http://localhost:3000';

    // Build line items for all products in package
    const lineItems = includedProducts.map((product: any) => ({
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: {
          name: product.name,
          description: product.description || undefined,
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // If package has a discount, apply it
    // For now, we'll use the package price as the total
    // In production, you might want to calculate discount separately

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      customer_email: email || undefined,
      metadata: {
        packageId: packageId,
        userId: userId || '',
        type: 'package',
        includedProducts: JSON.stringify(packageProduct.packageProducts || [])
      }
    });

    logger.info('Package checkout session created', {
      sessionId: session.id,
      packageId,
      userId
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    logger.error('Error creating package checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

