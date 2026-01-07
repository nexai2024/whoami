/**
 * GET /api/pages/[pageId]/content/optimize - Get AI content optimization suggestions
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch page and blocks
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: blockId
          ? {
              where: { id: blockId }
            }
          : true,
        user: {
          include: {
            profile: true
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

    // Generate optimization suggestions
    const optimizations = generateContentOptimizations(page, blockId);

    // Save suggestions to database
    await Promise.all(
      optimizations.map(opt =>
        prisma.contentOptimization.upsert({
          where: {
            id: `${pageId}-${opt.field}-${blockId || 'page'}`
          },
          create: {
            pageId,
            blockId: blockId || null,
            userId,
            suggestionType: opt.suggestionType,
            field: opt.field,
            currentValue: opt.currentValue,
            suggestedValue: opt.suggestedValue,
            reason: opt.reason,
            priority: opt.priority,
            impactScore: opt.impactScore
          },
          update: {
            currentValue: opt.currentValue,
            suggestedValue: opt.suggestedValue,
            reason: opt.reason
          }
        })
      )
    );

    // Fetch all optimizations (including existing)
    const allOptimizations = await prisma.contentOptimization.findMany({
      where: {
        pageId,
        blockId: blockId || null,
        applied: false
      },
      orderBy: [
        { priority: 'desc' },
        { impactScore: 'desc' }
      ]
    });

    return NextResponse.json({
      optimizations: allOptimizations.map((opt: { id: any; suggestionType: any; field: any; currentValue: any; suggestedValue: any; reason: any; priority: any; impactScore: any; applied: any; }) => ({
        id: opt.id,
        suggestionType: opt.suggestionType,
        field: opt.field,
        currentValue: opt.currentValue,
        suggestedValue: opt.suggestedValue,
        reason: opt.reason,
        priority: opt.priority,
        impactScore: opt.impactScore,
        applied: opt.applied
      }))
    });
  } catch (error) {
    console.error('Error generating optimizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateContentOptimizations(page: any, blockId?: string | null): any[] {
  const optimizations: any[] = [];

  // Page-level optimizations
  if (!blockId) {
    // Title optimization
    if (!page.metaTitle || page.metaTitle.length < 30) {
      optimizations.push({
        suggestionType: 'meta_title',
        field: 'metaTitle',
        currentValue: page.metaTitle || page.title,
        suggestedValue: generateOptimizedTitle(page),
        reason: 'Titles under 30 characters miss opportunities for keywords. Optimal length is 50-60 characters.',
        priority: 'high',
        impactScore: 15
      });
    }

    // Description optimization
    if (!page.metaDescription || page.metaDescription.length < 120) {
      optimizations.push({
        suggestionType: 'meta_description',
        field: 'metaDescription',
        currentValue: page.metaDescription || page.description,
        suggestedValue: generateOptimizedDescription(page),
        reason: 'Meta descriptions should be 150-160 characters to maximize click-through rates.',
        priority: 'high',
        impactScore: 15
      });
    }

    // Keywords optimization
    if (!page.metaKeywords) {
      optimizations.push({
        suggestionType: 'meta_keywords',
        field: 'metaKeywords',
        currentValue: null,
        suggestedValue: generateKeywords(page),
        reason: 'Adding relevant keywords helps search engines understand your content.',
        priority: 'low',
        impactScore: 2
      });
    }
  }

  // Block-level optimizations
  if (blockId) {
    const block = page.blocks.find((b: any) => b.id === blockId);
    if (block) {
      // Title optimization
      if (!block.title || block.title.length < 5) {
        optimizations.push({
          suggestionType: 'block_title',
          field: 'title',
          currentValue: block.title,
          suggestedValue: generateBlockTitle(block),
          reason: 'Block titles should be descriptive and include relevant keywords.',
          priority: 'medium',
          impactScore: 5
        });
      }

      // Description optimization
      if (block.type === 'TEXT_BLOCK' && (!block.description || block.description.length < 50)) {
        optimizations.push({
          suggestionType: 'block_description',
          field: 'description',
          currentValue: block.description,
          suggestedValue: generateBlockDescription(block),
          reason: 'Descriptive content helps with SEO and user engagement.',
          priority: 'medium',
          impactScore: 5
        });
      }
    }
  } else {
    // Optimize all blocks
    page.blocks.forEach((block: any) => {
      if (!block.title || block.title.length < 5) {
        optimizations.push({
          suggestionType: 'block_title',
          field: `blocks.${block.id}.title`,
          currentValue: block.title,
          suggestedValue: generateBlockTitle(block),
          reason: 'Improve block title for better SEO and clarity.',
          priority: 'low',
          impactScore: 2
        });
      }
    });
  }

  return optimizations;
}

function generateOptimizedTitle(page: any): string {
  const profile = page.user?.profile;
  const name = profile?.displayName || profile?.username || 'Creator';
  const title = profile?.title || '';
  const company = profile?.company || '';
  
  if (title && company) {
    return `${name} - ${title} at ${company} | Professional Profile on WhoAmI`;
  } else if (title) {
    return `${name} - ${title} | Expert Profile on WhoAmI`;
  } else {
    return `${name}'s Professional Page | Discover on WhoAmI`;
  }
}

function generateOptimizedDescription(page: any): string {
  const profile = page.user?.profile;
  const bio = profile?.bio || page.description || '';
  const name = profile?.displayName || profile?.username || 'Creator';
  const title = profile?.title || '';
  
  if (bio && bio.length >= 120 && bio.length <= 160) {
    return bio;
  } else if (bio) {
    return bio.substring(0, 157) + '...';
  } else {
    return `${name}${title ? ` - ${title}` : ''}. Discover more about my work, services, and expertise on WhoAmI. Connect and explore my professional journey.`;
  }
}

function generateKeywords(page: any): string {
  const keywords: string[] = [];
  const profile = page.user?.profile;
  
  if (profile?.title) keywords.push(profile.title.toLowerCase());
  if (profile?.company) keywords.push(profile.company.toLowerCase());
  if (profile?.industry) keywords.push(profile.industry.toLowerCase());
  
  // Extract from blocks
  if (page.blocks) {
    page.blocks.forEach((block: any) => {
      if (block.type === 'PRODUCT') keywords.push('product', 'digital product', 'ecommerce');
      if (block.type === 'COURSE') keywords.push('course', 'education', 'learning', 'online course');
      if (block.type === 'BOOKING_CALENDAR') keywords.push('booking', 'consultation', 'appointment');
      if (block.type === 'CONTACT_FORM') keywords.push('contact', 'inquiry', 'reach out');
    });
  }
  
  return [...new Set(keywords)].slice(0, 10).join(', ');
}

function generateBlockTitle(block: any): string {
  const typeMap: Record<string, string> = {
    'PRODUCT': 'Featured Product',
    'COURSE': 'Online Course',
    'BOOKING_CALENDAR': 'Book a Consultation',
    'CONTACT_FORM': 'Get in Touch',
    'EMAIL_CAPTURE': 'Join Our Newsletter',
    'LINK': 'Important Link'
  };
  
  return typeMap[block.type] || block.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
}

function generateBlockDescription(block: any): string {
  if (block.type === 'TEXT_BLOCK') {
    return 'Add compelling content here to engage your audience and improve SEO.';
  }
  return 'Add a description to help visitors understand what this section offers.';
}






