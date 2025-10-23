import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slug';
import { stackServerApp } from "@/stack/server";

// GET: Return all pages or a specific page by slug
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    // If slug is provided, fetch public page with all data (for link-in-bio pages)
    if (slug) {
      logger.info(`Fetching public page by slug: ${slug}`);

      const page = await prisma.page.findUnique({
        where: { slug },
        include: {
          pageHeader: true,
          blocks: {
            where: { isActive: true },
            orderBy: { position: 'asc' }
          }
        }
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      if (!page.isActive) {
        return NextResponse.json({ error: 'Page is not published' }, { status: 404 });
      }

      // Transform pageHeader data from JSON to flat object
      const pageHeader = page.pageHeader ? {
        ...page.pageHeader.data,
        id: page.pageHeader.id,
        pageId: page.pageHeader.pageId
      } : null;

      // Transform blocks data from JSON
      const blocks = page.blocks.map(block => ({
        id: block.id,
        pageId: block.pageId,
        type: block.type,
        title: block.data?.title || block.type,
        url: block.data?.url,
        data: block.data,
        position: block.position,
        isActive: block.isActive,
        createdAt: block.createdAt,
        updatedAt: block.updatedAt
      }));

      return NextResponse.json({
        ...page,
        pageHeader,
        blocks
      });
    }

    // Otherwise, fetch authenticated user's pages
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    logger.info(`Fetched ${pages.length} pages for user: ${user.id}`);
    return NextResponse.json(pages);
  } catch (error) {
    logger.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
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
          const title = 'New Page'
          const description = 'New page description'
          const slug = await generateSlug(title);
          logger.info("Creating page with slug:", slug);
          //const pageId = `page_${Date.now()}`;
          const newPage = await prisma.Page.create({
            data: {
            userId: user?.id,
            slug,
            title,
            description,
            isActive: false, // Start as draft
            createdAt: new Date(),
            updatedAt: new Date()
          } });
          if (!newPage) {
            throw new Error('Failed to create page');
          }
          logger.info("New page created:", newPage);

          logger.info("Now creating header for new page");
          const newPageHeader = await prisma.pageHeader.create({
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
              //pages.push(newPage);
    return NextResponse.json(newPage, { status: 201 });
          if (!newPageHeader) {
            throw new Error('Failed to create page header');
          }
          logger.info("New page header created:", newPageHeader);

          logger.info(`Page created successfully: ${newPage.id}`);
          return {
            ...newPage,
            blocks: [],
            _count: { clicks: 0 }
          };
        } catch (error) {
          logger.error('Error creating page:', error);
          throw new Error('Failed to create page');
        }

}
