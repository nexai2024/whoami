import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';
import { getAuthenticatedUser, requireResourceOwnership } from '@/lib/auth/serverAuth';

// GET: Fetch all blocks for a page
export async function GET(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  
  try {
    // Get authenticated user (optional - for public access)
    const auth = await getAuthenticatedUser(req);
    const userId = auth?.userId || null;
    
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
    
    // Get actual click count from database (with error handling)
    let clickCount = 0;
    try {
      clickCount = await prisma.click.count({
        where: { pageId: pageId }
      });
    } catch (countError) {
      logger.error('Error counting clicks:', countError);
      // Continue with 0 if count fails
    }
    
    return NextResponse.json({
      ...page,
      pageHeader,
      blocks,
      user,
      _count: { clicks: clickCount }
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
  const headerData = await req.json();
  
  try {
    // Require authentication and ownership
    const auth = await requireResourceOwnership(req, pageId, 'page');
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode }
      );
    }

    const userId = auth.userId!;
    logger.info("Page data received for update:", headerData);
    
    // Validate page exists
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
  
  try {
    // Require authentication and ownership
    const auth = await requireResourceOwnership(req, pageId, 'page');
    
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode }
      );
    }

    const userId = auth.userId!;

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