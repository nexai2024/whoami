/**
 * POST /api/checkout/packages/[packageId]
 * Create checkout session for a package (bundle of products)
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
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
      where: { id: packageId }
    });

    if (!packageProduct) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get user and profile separately since Product doesn't have a user relation
    const user = await prisma.user.findUnique({
      where: { id: packageProduct.userId },
      include: {
        profile: true
      }
    });

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

    // Payment processing not available - Stripe has been removed
    return NextResponse.json(
      { error: 'Payment processing is not currently available. Please contact support.' },
      { status: 503 }
    );
  } catch (error) {
    logger.error('Error in package checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
