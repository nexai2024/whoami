/**
 * GET /api/templates/products - List product templates
 * POST /api/templates/products - Create product template from existing product
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const myTemplates = searchParams.get('myTemplates') === 'true';

    // Build where clause
    const where: any = {};

    if (myTemplates) {
      where.userId = userId;
    } else {
      // Show public templates and user's own templates
      where.OR = [
        { isPublic: true },
        { userId }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.featured = true;
    }

    const templates = await prisma.productTemplate.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        price: template.price,
        currency: template.currency,
        downloadLimit: template.downloadLimit,
        category: template.category,
        thumbnailUrl: template.thumbnailUrl,
        useCount: template.useCount,
        featured: template.featured,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching product templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      currency,
      downloadLimit,
      category,
      isPublic,
      productId // If creating from existing product
    } = body;

    // Validation
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 3-100 characters' },
        { status: 400 }
      );
    }

    if (!price || price < 0.5) {
      return NextResponse.json(
        { error: 'Price must be at least $0.50' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // If creating from existing product, fetch product data
    let templateData: any = {
      userId,
      name,
      description,
      price,
      currency: currency || 'USD',
      downloadLimit,
      category,
      isPublic: isPublic || false
    };

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      if (product.userId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Use product data as defaults if not provided
      templateData = {
        ...templateData,
        name: name || `${product.name} Template`,
        description: description || product.description,
        price: price || product.price,
        currency: currency || product.currency,
        downloadLimit: downloadLimit || product.downloadLimit
      };
    }

    const template = await prisma.productTemplate.create({
      data: templateData
    });

    return NextResponse.json({
      templateId: template.id,
      message: 'Product template created successfully'
    });
  } catch (error) {
    console.error('Error creating product template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
