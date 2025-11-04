import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { stackServerApp } from '@/stack/server';

// GET: Get subdomain for a page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        userId: true,
        subdomain: true,
        slug: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (page.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      subdomain: page.subdomain,
      slug: page.slug,
    });
  } catch (error) {
    logger.error('Error fetching subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subdomain' },
      { status: 500 }
    );
  }
}

// POST: Set subdomain for a page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let { subdomain } = body;

    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Normalize subdomain
    subdomain = subdomain.toLowerCase().trim();

    // Validate subdomain format (alphanumeric and hyphens only, 3-63 chars)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens (3-63 characters)' },
        { status: 400 }
      );
    }

    // Check reserved subdomains
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'test', 'staging', 'dev'];
    if (reserved.includes(subdomain)) {
      return NextResponse.json(
        { error: 'This subdomain is reserved and cannot be used' },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, userId: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (page.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if subdomain is already taken
    const existingPage = await prisma.page.findFirst({
      where: {
        subdomain: subdomain,
        id: { not: pageId },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
      );
    }

    // Update page with subdomain
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        subdomain: subdomain,
      },
    });

    logger.info(`Subdomain set for page ${pageId}: ${subdomain}`);

    return NextResponse.json({
      subdomain: updatedPage.subdomain,
      message: 'Subdomain set successfully',
      url: `https://${subdomain}.whoami.click`,
    });
  } catch (error: any) {
    logger.error('Error setting subdomain:', error);
    
    // Handle unique constraint violation
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to set subdomain' },
      { status: 500 }
    );
  }
}

// DELETE: Remove subdomain
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, userId: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (page.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.page.update({
      where: { id: pageId },
      data: {
        subdomain: null,
      },
    });

    logger.info(`Subdomain removed for page ${pageId}`);

    return NextResponse.json({ message: 'Subdomain removed successfully' });
  } catch (error) {
    logger.error('Error removing subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to remove subdomain' },
      { status: 500 }
    );
  }
}
