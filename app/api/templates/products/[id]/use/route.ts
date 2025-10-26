/**
 * POST /api/templates/products/[id]/use - Use template to create product
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const template = await prisma.productTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check access
    if (!template.isPublic && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      fileUrl,
      createStripeProduct
    } = body;

    // Create product from template
    const product = await prisma.product.create({
      data: {
        userId,
        name: name || template.name,
        description: description || template.description,
        price: template.price,
        currency: template.currency,
        downloadLimit: template.downloadLimit,
        fileUrl: fileUrl || null,
        isActive: true
        // Stripe integration would be handled separately if createStripeProduct is true
      }
    });

    // Increment use count
    await prisma.productTemplate.update({
      where: { id: template.id },
      data: { useCount: template.useCount + 1 }
    });

    return NextResponse.json({
      productId: product.id,
      message: 'Product created from template successfully'
    });
  } catch (error) {
    console.error('Error using product template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
