import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    if (!page.isActive) {
      return NextResponse.json(
        { error: 'Page is not published' },
        { status: 403 }
      );
    }

    // Get page header
    const pageHeader = await prisma.pageHeader.findUnique({
      where: { pageId: page.id },
    });

    if (!pageHeader) {
      return NextResponse.json(
        { error: 'Page header not found' },
        { status: 404 }
      );
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

    logger.info(`Page loaded successfully via API: ${slug}`);
    return NextResponse.json(pageWithData);

  } catch (error) {
    logger.error('Error fetching page by slug via API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}