/**
 * GET /api/products - List all products for authenticated user
 * POST /api/products - Create new product with Stripe integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { stripe } from '@/lib/stripe';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = { userId };
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Get products with sales count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sales: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        fileUrl: product.fileUrl,
        downloadLimit: product.downloadLimit,
        isActive: product.isActive,
        stripeProductId: product.stripeProductId,
        stripePriceId: product.stripePriceId,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        salesCount: product._count.sales
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = 'USD',
      fileUrl,
      downloadLimit,
      isActive = true,
      createStripeProduct = true
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!price || price < 0.5) {
      return NextResponse.json(
        { error: 'Price must be at least $0.50 (Stripe minimum)' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Product name must be 3-100 characters' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Validate fileUrl format if provided
    if (fileUrl) {
      try {
        new URL(fileUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid file URL format' },
          { status: 400 }
        );
      }
    }

    // Validate downloadLimit
    if (downloadLimit && downloadLimit < 1) {
      return NextResponse.json(
        { error: 'Download limit must be at least 1' },
        { status: 400 }
      );
    }

    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    // Create Stripe product and price if requested
    if (createStripeProduct) {
      try {
        // Create Stripe Product
        const stripeProduct = await stripe.products.create({
          name,
          description: description || undefined,
          metadata: {
            userId
          }
        });
        stripeProductId = stripeProduct.id;

        // Create Stripe Price
        const stripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(price * 100), // Convert to cents
          currency: currency.toLowerCase()
        });
        stripePriceId = stripePrice.id;
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue with product creation even if Stripe fails
        // This allows users to create products without Stripe integration
      }
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        userId,
        name,
        description,
        price,
        currency,
        fileUrl,
        downloadLimit,
        isActive,
        stripeProductId,
        stripePriceId
      }
    });

    return NextResponse.json({
      productId: product.id,
      stripeProductId,
      stripePriceId,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
