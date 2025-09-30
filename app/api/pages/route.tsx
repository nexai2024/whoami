import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { logger } from '@/lib/utils/logger';
import { generateSlug } from '@/lib/utils/slug';
import { stackServerApp } from "@/stack/server";
// Dummy in-memory data store
let pages: { id: number; title: string; content: string }[] = [
    { id: 1, title: 'Home', content: 'Welcome to the homepage.' },
    { id: 2, title: 'About', content: 'About us page.' },
];
//const userId = await 
// GET: Return all pages
export async function GET(req: NextRequest) {
      const user = await stackServerApp.getUser();  // or: stackServerApp.getUser({ or: "redirect" })
    const pages = await prisma.Page.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      });
      console.log("Fetched pages for user:", user?.id, pages);

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