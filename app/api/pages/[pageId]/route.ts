import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
 
// GET: Fetch all blocks for a page
export async function GET(req: NextRequest, { params }: { params: { pageId: string } }) {
    const { pageId } = await params;
    try {
        const page =  await prisma.page.findUnique({
          where: { id: pageId },
        });
        if (!page) {
          throw new Error('Page not found');
        }
        
        // Get page header
        const pageHeader = await prisma.pageHeader.findUnique({
          where: { pageId: pageId },
        });
        if (!pageHeader) {
          throw new Error('Page header not found');
        }
        
        //const user = await UserService.getUserById(page.userId);
        
        // Get blocks
        const blocks = await prisma.block.findMany({
          where: { pageId: pageId},
          orderBy: { position: 'asc' }
        });
        
        logger.info(`Page loaded successfully: ${pageId}`);
        
        return NextResponse.json({
          ...page,
          pageHeader,
          blocks,
          _count: { clicks: Math.floor(Math.random() * 1000) }
        });
      } catch (error) {
        logger.error(`Error fetching page ${pageId}:`, error);
        throw error;
      }
}
