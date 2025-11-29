import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slug';
import { requireAuth, requireFeature } from '@/lib/auth/serverAuth';
import { RateLimitService } from '@/lib/rate-limit';
// Dummy in-memory data store
const pages: { id: number; title: string; content: string }[] = [
    { id: 1, title: 'Home', content: 'Welcome to the homepage.' },
    { id: 2, title: 'About', content: 'About us page.' },
];
//const userId = await 
// GET: Return all pages
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    
    // Check if auth failed (AuthorizationResult with authorized: false)
    if ('authorized' in auth && !auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode || 401 }
      );
    }

    // Auth succeeded - extract userId from AuthResult
    const userId = 'userId' in auth ? auth.userId : null;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pages = await prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            clicks: true
          }
        }
      }
    });

    return NextResponse.json(pages);
  } catch (error) {
    logger.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a new page
export async function POST(req: NextRequest) {
  try {
    // Require authentication and feature access
    const auth = await requireFeature(req, 'pages');
    
    if (!auth.authorized) {
      return NextResponse.json(
        {
          error: auth.error || 'Page limit reached for your plan',
          limit: auth.featureResult?.limit,
          remaining: auth.featureResult?.remaining ?? 0,
          resetAt: auth.featureResult?.resetAt?.toISOString()
        },
        { status: auth.statusCode || 403 }
      );
    }

    const userId = auth.userId!;
    logger.info("Creating page with data: userId", userId);

    // Read metadata from request body if provided, fallback to defaults
    const body = await req.json().catch(() => ({}));
    const title = body.title || 'New Page';
    const description = body.description || 'New page description';

    const slug = await generateSlug(title);
    logger.info("Creating page with slug:", slug);

    // Wrap page + header creation in transaction for atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Create page
      const newPage = await tx.page.create({
        data: {
          userId,
          slug,
          title,
          description,
          isActive: false, // Start as draft
        }
      });

      if (!newPage) {
        throw new Error('Failed to create page');
      }
      logger.info("New page created:", newPage);

      logger.info("Now creating header for new page");
      // Create header
      const newPageHeader = await tx.pageHeader.create({
        data: {
          pageId: newPage.id,
          data: {
            logoUrl: null,
            displayName: '',
            bio: '',
            location: '',
            contactEmail: '',
            phoneNumber: null,
            socialLinks: {},
            headerStyle: 'minimal',
            showContactInfo: false,
            showSocialLinks: false,
            showLocation: false,
            customIntroduction: ''
          }
        }
      });

      // Return both from transaction
      return { newPage, newPageHeader };
    });

    // Validate header creation after transaction
    if (!result.newPageHeader) {
      throw new Error('Failed to create page header');
    }
    logger.info("New page header created:", result.newPageHeader);

    logger.info(`Page created successfully: ${result.newPage.id}`);

    // Record usage for 'pages'
    await RateLimitService.incrementUsage(userId, 'pages');

    // Return complete response structure
    return NextResponse.json({
      ...result.newPage,
      blocks: [],
      _count: { clicks: 0 }
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}