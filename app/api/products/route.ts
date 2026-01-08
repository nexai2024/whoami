/**
 * GET /api/products - List all products for authenticated user
 * POST /api/products - Create new product
 */

import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { Product } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { requireAuth } from '@/lib/auth/serverAuth';
import { handleApiError, successResponse } from '@/lib/utils/apiError';
import { validateQuery, validateRequest, paginationSchema, productSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    
    if ('authorized' in auth && !auth.authorized) {
      return handleApiError(new Error(auth.error || 'Unauthorized'), 'GET /api/products');
    }

    const userId = 'userId' in auth ? auth.userId : null;
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), 'GET /api/products');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Validate pagination
    const pagination = validateQuery(searchParams, paginationSchema);
    if (!pagination.success) {
      return handleApiError(pagination.error, 'GET /api/products');
    }
    
    const { limit, offset = 0 } = pagination.data;

    // Build where clause
    const where: { userId: string; isActive?: boolean } = { userId };
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

    return successResponse({
      products: products.map((product: Product & { _count?: { sales: number } }) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        fileUrl: product.fileUrl,
        downloadLimit: product.downloadLimit,
        isActive: product.isActive,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        salesCount: product._count?.sales || 0
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/products');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    
    if ('authorized' in auth && !auth.authorized) {
      return handleApiError(new Error(auth.error || 'Unauthorized'), 'POST /api/products');
    }

    const userId = 'userId' in auth ? auth.userId : null;
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), 'POST /api/products');
    }

    // Validate request body
    const validation = await validateRequest(request, productSchema);
    if (!validation.success) {
      return handleApiError(validation.error, 'POST /api/products');
    }

    const productData = validation.data;

    // Create product in database
    const product = await prisma.product.create({
      data: {
        userId,
        ...productData
      }
    });

    return successResponse({
      productId: product.id,
      message: 'Product created successfully'
    }, 201);
  } catch (error) {
    return handleApiError(error, 'POST /api/products');
  }
}
