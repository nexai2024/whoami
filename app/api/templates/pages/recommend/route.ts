/**
 * GET /api/templates/pages/recommend - Get AI-powered template recommendations
 * Based on user profile, page content, and industry
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    const pageId = searchParams.get('pageId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile and page data for recommendations
    let userProfile = null;
    let pageData = null;

    if (userId) {
      userProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true
        }
      });
    }

    if (pageId) {
      pageData = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
          blocks: {
            select: {
              type: true
            }
          }
        }
      });
    }

    // Analyze user profile and page to determine recommendations
    const profile = userProfile?.profile;
    const industry = profile?.industry || searchParams.get('industry');
    const pageBlocks = pageData?.blocks || [];
    
    // Determine user type based on profile and content
    const hasProducts = pageBlocks.some(b => b.type === 'PRODUCT');
    const hasCourses = pageBlocks.some(b => b.type === 'COURSE');
    const isCoach = profile?.isCoach || false;
    const isCreator = profile?.bio?.toLowerCase().includes('creator') || 
                     profile?.bio?.toLowerCase().includes('influencer') ||
                     false;

    // Build recommendation criteria
    const criteria: any = {
      OR: [
        { isPublic: true },
        { userId }
      ]
    };

    // Industry-based recommendations
    if (industry) {
      criteria.industry = industry;
    }

    // Type-based recommendations
    if (isCoach) {
      criteria.OR = [
        ...(criteria.OR || []),
        { category: 'Coaches' },
        { tags: { hasSome: ['coach', 'consulting', 'mentor'] } }
      ];
    }

    if (isCreator) {
      criteria.OR = [
        ...(criteria.OR || []),
        { category: 'Creators/Influencers' },
        { tags: { hasSome: ['creator', 'influencer', 'content'] } }
      ];
    }

    if (hasProducts) {
      criteria.OR = [
        ...(criteria.OR || []),
        { category: 'Product Launch' },
        { tags: { hasSome: ['product', 'ecommerce', 'sales'] } }
      ];
    }

    if (hasCourses) {
      criteria.OR = [
        ...(criteria.OR || []),
        { category: 'Course Creator' },
        { tags: { hasSome: ['course', 'education', 'teaching'] } }
      ];
    }

    // Fetch recommended templates
    const recommendedTemplates = await prisma.pageTemplate.findMany({
      where: criteria,
      orderBy: [
        { featured: 'desc' },
        { useCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 12,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        industry: true,
        tags: true,
        templateType: true,
        thumbnailUrl: true,
        useCount: true,
        rating: true,
        featured: true,
        createdAt: true
      }
    });

    // Also get popular templates as fallback
    const popularTemplates = await prisma.pageTemplate.findMany({
      where: {
        OR: [
          { isPublic: true },
          { userId }
        ],
        featured: true
      },
      orderBy: {
        useCount: 'desc'
      },
      take: 6,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        industry: true,
        tags: true,
        templateType: true,
        thumbnailUrl: true,
        useCount: true,
        rating: true,
        featured: true,
        createdAt: true
      }
    });

    // Combine and deduplicate
    const allTemplates = [...recommendedTemplates];
    const existingIds = new Set(recommendedTemplates.map(t => t.id));
    
    popularTemplates.forEach(t => {
      if (!existingIds.has(t.id)) {
        allTemplates.push(t);
      }
    });

    return NextResponse.json({
      recommendations: allTemplates.slice(0, 12).map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        reason: getRecommendationReason(t, { isCoach, isCreator, hasProducts, hasCourses, industry })
      })),
      insights: {
        userType: isCoach ? 'coach' : isCreator ? 'creator' : hasProducts ? 'seller' : hasCourses ? 'educator' : 'general',
        industry: industry || 'not specified',
        recommendedCategories: [
          ...(isCoach ? ['Coaches'] : []),
          ...(isCreator ? ['Creators/Influencers'] : []),
          ...(hasProducts ? ['Product Launch'] : []),
          ...(hasCourses ? ['Course Creator'] : [])
        ]
      }
    });
  } catch (error) {
    console.error('Error generating template recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getRecommendationReason(template: any, context: any): string {
  if (template.featured) {
    return 'Featured template';
  }
  if (context.isCoach && template.category === 'Coaches') {
    return 'Perfect for coaches';
  }
  if (context.isCreator && template.category === 'Creators/Influencers') {
    return 'Great for creators';
  }
  if (context.hasProducts && template.category === 'Product Launch') {
    return 'Ideal for product pages';
  }
  if (context.hasCourses && template.category === 'Course Creator') {
    return 'Perfect for course creators';
  }
  if (context.industry && template.industry === context.industry) {
    return `Designed for ${context.industry}`;
  }
  if (template.useCount > 100) {
    return 'Popular choice';
  }
  return 'Recommended for you';
}


