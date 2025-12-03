/**
 * POST /api/pages/[pageId]/seo/optimize - Get automated SEO optimization suggestions
 * Analyzes page and provides specific, actionable optimization recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auditPageSEO } from '@/lib/seo/seoAudit';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch page data
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        blocks: {
          select: {
            type: true,
            title: true,
            description: true,
            data: true
          }
        }
      }
    });

    if (!page || page.userId !== userId) {
      return NextResponse.json(
        { error: 'Page not found or unauthorized' },
        { status: 404 }
      );
    }

    // Perform audit
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';
    const pageUrl = page.customDomain 
      ? `https://${page.customDomain}`
      : page.subdomain
        ? `${baseUrl}/p/${page.subdomain}`
        : undefined;

    const audit = auditPageSEO({
      title: page.title,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      description: page.description,
      ogImage: page.ogImage,
      url: pageUrl,
      customDomain: page.customDomain || undefined,
      subdomain: page.subdomain || undefined,
      blocks: page.blocks,
      user: {
        profile: {
          displayName: page.user.profile?.displayName || undefined,
          bio: page.user.profile?.bio || undefined
        }
      }
    });

    // Generate optimization suggestions
    const optimizations = generateOptimizations(audit, page, body.autoApply || false);

    return NextResponse.json({
      currentScore: audit.score,
      potentialScore: audit.score + optimizations.reduce((sum, opt) => sum + (opt.impact || 0), 0),
      optimizations,
      quickWins: optimizations.filter(opt => opt.impact && opt.impact >= 5 && opt.effort === 'low'),
      estimatedTime: optimizations.reduce((sum, opt) => sum + (opt.estimatedMinutes || 0), 0)
    });
  } catch (error) {
    console.error('Error generating SEO optimizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateOptimizations(audit: any, page: any, autoApply: boolean): any[] {
  const optimizations: any[] = [];

  // Title optimization
  if (!page.metaTitle || page.metaTitle.length < 30) {
    optimizations.push({
      type: 'metaTitle',
      priority: 'high',
      impact: 15,
      effort: 'low',
      estimatedMinutes: 2,
      current: page.metaTitle || page.title || 'Missing',
      suggestion: generateTitleSuggestion(page),
      action: autoApply ? {
        field: 'metaTitle',
        value: generateTitleSuggestion(page)
      } : null
    });
  }

  // Meta description optimization
  if (!page.metaDescription || page.metaDescription.length < 120) {
    optimizations.push({
      type: 'metaDescription',
      priority: 'high',
      impact: 15,
      effort: 'low',
      estimatedMinutes: 3,
      current: page.metaDescription || page.description || 'Missing',
      suggestion: generateDescriptionSuggestion(page),
      action: autoApply ? {
        field: 'metaDescription',
        value: generateDescriptionSuggestion(page)
      } : null
    });
  }

  // OG Image
  if (!page.ogImage) {
    optimizations.push({
      type: 'ogImage',
      priority: 'medium',
      impact: 10,
      effort: 'medium',
      estimatedMinutes: 10,
      current: 'Not set',
      suggestion: 'Add an Open Graph image (1200x630px)',
      action: null
    });
  }

  // Keywords
  if (!page.metaKeywords) {
    optimizations.push({
      type: 'metaKeywords',
      priority: 'low',
      impact: 2,
      effort: 'low',
      estimatedMinutes: 2,
      current: 'Not set',
      suggestion: generateKeywordsSuggestion(page),
      action: autoApply ? {
        field: 'metaKeywords',
        value: generateKeywordsSuggestion(page)
      } : null
    });
  }

  // Content optimization
  const hasContent = page.blocks && page.blocks.length > 0;
  if (!hasContent) {
    optimizations.push({
      type: 'content',
      priority: 'high',
      impact: 10,
      effort: 'high',
      estimatedMinutes: 30,
      current: 'No content blocks',
      suggestion: 'Add content blocks to provide value to visitors',
      action: null
    });
  }

  return optimizations;
}

function generateTitleSuggestion(page: any): string {
  const profile = page.user?.profile;
  const name = profile?.displayName || profile?.username || 'Creator';
  const title = profile?.title || '';
  const company = profile?.company || '';
  
  if (title && company) {
    return `${name} - ${title} at ${company} | WhoAmI`;
  } else if (title) {
    return `${name} - ${title} | WhoAmI`;
  } else {
    return `${name}'s Page | WhoAmI`;
  }
}

function generateDescriptionSuggestion(page: any): string {
  const profile = page.user?.profile;
  const bio = profile?.bio || page.description || '';
  
  if (bio && bio.length >= 120 && bio.length <= 160) {
    return bio;
  } else if (bio) {
    return bio.substring(0, 157) + '...';
  } else {
    const name = profile?.displayName || profile?.username || 'Creator';
    const title = profile?.title || '';
    return `${name}${title ? ` - ${title}` : ''}. Discover more on WhoAmI.`;
  }
}

function generateKeywordsSuggestion(page: any): string {
  const keywords: string[] = [];
  const profile = page.user?.profile;
  
  if (profile?.title) keywords.push(profile.title.toLowerCase());
  if (profile?.company) keywords.push(profile.company.toLowerCase());
  if (profile?.industry) keywords.push(profile.industry.toLowerCase());
  
  // Extract from blocks
  if (page.blocks) {
    page.blocks.forEach((block: any) => {
      if (block.type === 'PRODUCT') keywords.push('product', 'digital product');
      if (block.type === 'COURSE') keywords.push('course', 'education', 'learning');
      if (block.type === 'BOOKING_CALENDAR') keywords.push('booking', 'consultation');
    });
  }
  
  return [...new Set(keywords)].slice(0, 10).join(', ');
}


