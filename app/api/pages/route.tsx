import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slug';
import { stackServerApp } from "@/stack/server";
import { RateLimitService } from '@/lib/rate-limit';
// Dummy in-memory data store
const pages: { id: number; title: string; content: string }[] = [
    { id: 1, title: 'Home', content: 'Welcome to the homepage.' },
    { id: 2, title: 'About', content: 'About us page.' },
];
//const userId = await 
// GET: Return all pages
export async function GET(req: NextRequest) {
      const user = await stackServerApp.getUser();  // or: stackServerApp.getUser({ or: "redirect" })
    const pages = await prisma.page.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              clicks: true
            }
          }
        }
      });
      //console.log("Fetched pages for user:", user?.id, pages);

    return NextResponse.json(pages);
}

// POST: Add a new page
export async function POST(req: NextRequest) {
      const user = await stackServerApp.getUser();  
      logger.info("Authenticated user:", user);
      if (!user) {
        logger.warn("Unauthorized attempt to create page");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      } 
  // Replace with actual user ID from auth
       try {
          logger.info("Creating page with data: userId", user?.id);

          // Enforce plan-based page limit
          const limitCheck = await RateLimitService.checkFeatureAccess(user.id, 'pages');
          if (!limitCheck.allowed) {
            const msg = limitCheck.message || 'Page limit reached for your plan';
            return NextResponse.json(
              {
                error: msg,
                limit: limitCheck.limit ?? undefined,
                remaining: limitCheck.remaining ?? 0,
                resetAt: limitCheck.resetAt?.toISOString() ?? undefined
              },
              { status: 403 }
            );
          }

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
                userId: user?.id,
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
          await RateLimitService.incrementUsage(user.id, 'pages');

          // Return complete response structure
          return NextResponse.json({
            ...result.newPage,
            blocks: [],
            _count: { clicks: 0 }
          }, { status: 201 });

        } catch (error) {
          logger.error('Error creating page:', error);
          return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
        }

}