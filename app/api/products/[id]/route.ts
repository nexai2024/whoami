/**
 * GET /api/products/[id] - Fetch single product details
 * PATCH /api/products/[id] - Update existing product
 * DELETE /api/products/[id] - Delete product (soft or hard delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { requireResourceOwnership } from '@/lib/auth/serverAuth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and ownership
    const auth = await requireResourceOwnership(request, id, 'product');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sales: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const allSales = await prisma.sale.findMany({
      where: { productId: id }
    });

    const totalSales = allSales.length;
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);

    return NextResponse.json({
      id: product.id,
      userId: product.userId,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      fileUrl: product.fileUrl,
      downloadLimit: product.downloadLimit,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      sales: product.sales.map(sale => ({
        id: sale.id,
        buyerEmail: sale.buyerEmail,
        amount: sale.amount,
        currency: sale.currency,
        status: sale.status,
        createdAt: sale.createdAt.toISOString()
      })),
      totalSales,
      totalRevenue
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and ownership
    const auth = await requireResourceOwnership(request, id, 'product');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      fileUrl,
      downloadLimit,
      isActive,
    } = body;

    // Find existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate fields if provided
    if (name !== undefined && (name.length < 3 || name.length > 100)) {
      return NextResponse.json(
        { error: 'Product name must be 3-100 characters' },
        { status: 400 }
      );
    }

    if (description !== undefined && description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (price !== undefined && price < 0.5) {
      return NextResponse.json(
        { error: 'Price must be at least $0.50' },
        { status: 400 }
      );
    }

    if (fileUrl !== undefined && fileUrl) {
      try {
        new URL(fileUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid file URL format' },
          { status: 400 }
        );
      }
    }

    if (downloadLimit !== undefined && downloadLimit !== null && downloadLimit < 1) {
      return NextResponse.json(
        { error: 'Download limit must be at least 1' },
        { status: 400 }
      );
    }


    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (downloadLimit !== undefined) updateData.downloadLimit = downloadLimit;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update product in database
    await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      productId: id,
      message: 'Product updated successfully'
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and ownership
    const auth = await requireResourceOwnership(request, id, 'product');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode }
      );
    }

    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    // Find product
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (hard) {
      // Hard delete only allowed if no sales exist
      if (product._count.sales > 0) {
        return NextResponse.json(
          { error: 'Cannot permanently delete product with existing sales. Use soft delete instead.' },
          { status: 400 }
        );
      }

      await prisma.product.delete({
        where: { id }
      });
    } else {
      // Soft delete (set inactive)
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
