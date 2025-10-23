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
export async function POST(req: NextRequest) {
      const user = await stackServerApp.getUser();  // or: stackServerApp.getUser({ or: "redirect" })

      let slug: string | undefined;
      try {
        const { slug: reqSlug } = await req.json();
        slug = reqSlug;
      } catch (error) {
        logger.error("Failed to parse request body for slug:", error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }

      try {
        const page = await prisma.page.findUnique({
          where: { slug },
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        });
        if (!page) {
          throw new Error('Page not found');
        }
        if (!page.isActive) {
          throw new Error('Page is not published');
        }
        
        // Get page header
        const pageHeader = await prisma.pageHeader.findUnique({
          where: { pageId: page.id },
        });
        if (!pageHeader) {
          throw new Error('Page header not found');
        }
        
        // Get blocks
        const blocks = await prisma.block.findMany({
          where: { pageId: page.id, isActive: true },
          orderBy: { position: 'asc' }
        });
        
        const pageWithData = {
          ...page,
          pageHeader,
          blocks,
          _count: { clicks: Math.floor(Math.random() * 1000) }
        };
        
        logger.info(`Page loaded successfully: ${slug}`);
        return NextResponse.json(pageWithData);
      } catch (error) {
        logger.error(`Error fetching page by slug ${slug}:`, error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
      }
}
