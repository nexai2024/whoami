/**
 * GET /api/templates/pages/marketplace - Get marketplace templates with pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');

    const filter = searchParams.get('filter') || 'all';
    const sortBy = searchParams.get('sortBy') || 'popular';
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');

    const where: any = {
      isPublic: true
    };

    // Filter by price/license
    if (filter === 'free') {
      where.isPaid = false;
      where.licenseType = 'free';
    } else if (filter === 'paid') {
      where.isPaid = true;
    } else if (filter === 'premium') {
      where.licenseType = 'premium';
    }

    if (category) {
      where.category = category;
    }

    if (industry) {
      where.industry = industry;
    }

    // Build orderBy
    let orderBy: any[] = [];
    switch (sortBy) {
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'price':
        orderBy = [{ price: 'asc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { useCount: 'desc' }];
        break;
      case 'popular':
      default:
        orderBy = [{ totalSales: 'desc' }, { useCount: 'desc' }];
        break;
    }

    const templates = await prisma.pageTemplate.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        user: {
          include: {
            templateCreatorProfile: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    // Calculate average rating and format response
    const formattedTemplates = templates.map(template => {
      const reviews = template.reviews || [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : template.rating || 0;

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        thumbnailUrl: template.thumbnailUrl,
        price: template.price ? Number(template.price) : undefined,
        currency: template.currency,
        isPaid: template.isPaid,
        licenseType: template.licenseType,
        rating: avgRating,
        reviewCount: template._count.reviews,
        totalSales: template.totalSales,
        totalRevenue: template.totalRevenue ? Number(template.totalRevenue) : 0,
        creator: template.user?.templateCreatorProfile ? {
          displayName: template.user.templateCreatorProfile.displayName || template.user.email,
          avatarUrl: template.user.templateCreatorProfile.avatarUrl,
          verified: template.user.templateCreatorProfile.verified
        } : undefined
      };
    });

    return NextResponse.json({
      templates: formattedTemplates
    });
  } catch (error) {
    console.error('Error fetching marketplace templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






