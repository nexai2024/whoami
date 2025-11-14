import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';

// GET: Fetch all blocks for a page
export async function GET(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = await params;
    const userId = req.headers.get('x-user-id'); // Optional - may not be present for public access
    
    try {
        const page = await prisma.page.findUnique({
          where: { id: pageId },
          select: {
            id: true,
            userId: true,
            isActive: true,
            slug: true,
            title: true,
            description: true,
            backgroundColor: true,
            textColor: true,
            fontFamily: true,
            metaTitle: true,
            metaDescription: true,
            metaKeywords: true,
            ogImage: true,
            createdAt: true,
            updatedAt: true,
          }
        });
        
        if (!page) {
          return NextResponse.json(
            { error: 'Page not found' },
            { status: 404 }
          );
        }

        // Authorization check:
        // - Published pages (isActive: true) are publicly accessible
        // - Unpublished pages can only be viewed by the owner
        if (!page.isActive && page.userId !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized - this page is not published' },
            { status: 403 }
          );
        }
        
        // Get page header
        const pageHeader = await prisma.pageHeader.findUnique({
          where: { pageId: pageId },
        });
        
        if (!pageHeader) {
          return NextResponse.json(
            { error: 'Page header not found' },
            { status: 404 }
          );
        }
        
        // Get blocks - only active blocks for public, all blocks for owner
        const blocks = await prisma.block.findMany({
          where: {
            pageId: pageId,
            ...(page.userId !== userId ? { isActive: true } : {}), // Only active blocks for non-owners
          },
          orderBy: { position: 'asc' }
        });
        
        // Get user info for public pages
        let user = null;
        if (page.isActive) {
          const pageWithUser = await prisma.page.findUnique({
            where: { id: pageId },
            select: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          });
          user = pageWithUser?.user || null;
        }
        
        logger.info(`Page loaded successfully: ${pageId} (public: ${page.isActive}, owner: ${page.userId === userId})`);
        
        return NextResponse.json({
          ...page,
          pageHeader,
          blocks,
          user,
          _count: { clicks: Math.floor(Math.random() * 1000) }
        });
      } catch (error) {
        logger.error(`Error fetching page ${pageId}:`, error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const userId = req.headers.get('x-user-id');
  const headerData = await req.json();
  
  try {
    // Require authentication for updates
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log("Page data received for update:", headerData);
    
    // Step 1: Validate page exists and check ownership
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, userId: true }
    });
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' }, 
        { status: 404 }
      );
    }

    // Check ownership - only the page owner can update
    if (page.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - you can only update your own pages' },
        { status: 403 }
      );
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        slug: headerData.slug,
        title: headerData.title,
        description: headerData.description,
        updatedAt: new Date()
      }
    }) as Prisma.PageSelect;

    logger.info(`Page updated successfully: ${pageId} by user ${userId}`);
    
    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error) {
    logger.error(`Error updating page header ${pageId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const userId = req.headers.get('x-user-id');
  
  try {
    // Require authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify page exists and check ownership
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, userId: true, title: true }
    });
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check ownership - only the page owner can delete
    if (page.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - you can only delete your own pages' },
        { status: 403 }
      );
    }

    // Delete the page (Prisma will cascade delete related records: blocks, clicks, forms, header)
    await prisma.page.delete({
      where: { id: pageId }
    });

    logger.info(`Page deleted successfully: ${pageId} by user ${userId}`);
    
    return NextResponse.json(
      { success: true, message: 'Page deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error deleting page ${pageId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}