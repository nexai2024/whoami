import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slug';
import { requireAuth, requireFeature } from '@/lib/auth/serverAuth';
import { RateLimitService } from '@/lib/rate-limit';
import { handleApiError, successResponse } from '@/lib/utils/apiError';
import { validateRequest, pageSchema } from '@/lib/utils/validation';

// GET: Return all pages
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    
    // Check if auth failed (AuthorizationResult with authorized: false)
    if ('authorized' in auth && !auth.authorized) {
      return handleApiError(new Error(auth.error || 'Unauthorized'), 'GET /api/pages');
    }

    // Auth succeeded - extract userId from AuthResult
    const userId = 'userId' in auth ? auth.userId : null;
    
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), 'GET /api/pages');
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

    return successResponse(pages);
  } catch (error) {
    return handleApiError(error, 'GET /api/pages');
  }
}

// POST: Add a new page
export async function POST(req: NextRequest) {
  try {
    // Require authentication and feature access
    const auth = await requireFeature(req, 'pages');
    
    if (!auth.authorized) {
      return handleApiError(
        new Error(auth.error || 'Page limit reached for your plan'),
        'POST /api/pages'
      );
    }

    const userId = auth.userId!;
    logger.info("Creating page with data: userId", userId);

    // Validate request body
    const validation = await validateRequest(req, pageSchema.partial().extend({
      title: pageSchema.shape.title.optional().default('New Page'),
      description: pageSchema.shape.description.optional().default('New page description')
    }));
    
    if (!validation.success) {
      return handleApiError(validation.error, 'POST /api/pages');
    }

    const { title, description } = validation.data;
    const finalTitle = title || 'New Page';
    const finalDescription = description || 'New page description';

    const slug = await generateSlug(finalTitle);
    logger.info("Creating page with slug:", slug);

    // Wrap page + header creation in transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create page
      const newPage = await tx.page.create({
        data: {
          userId,
          slug,
          title: finalTitle,
          description: finalDescription,
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
    return successResponse({
      ...result.newPage,
      blocks: [],
      _count: { clicks: 0 }
    }, 201);

  } catch (error) {
    return handleApiError(error, 'POST /api/pages');
  }
}