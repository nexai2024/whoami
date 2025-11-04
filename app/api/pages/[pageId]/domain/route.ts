import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { stackServerApp } from '@/stack/server';
import crypto from 'crypto';

// GET: Get domain configuration for a page
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
        customDomain: true,
        customDomainStatus: true,
        customDomainVerifiedAt: true,
        subdomain: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (page.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      customDomain: page.customDomain,
      customDomainStatus: page.customDomainStatus,
      customDomainVerifiedAt: page.customDomainVerifiedAt,
      subdomain: page.subdomain,
    });
  } catch (error) {
    logger.error('Error fetching domain config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain configuration' },
      { status: 500 }
    );
  }
}

// POST: Set custom domain for a page
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
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check reserved domains
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost'];
    const domainParts = domain.split('.');
    if (reserved.includes(domainParts[0]?.toLowerCase())) {
      return NextResponse.json(
        { error: 'Reserved subdomain cannot be used' },
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

    // Check if domain is already taken by another page
    const existingPage = await prisma.page.findFirst({
      where: {
        customDomain: domain,
        id: { not: pageId },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'Domain is already in use' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = crypto
      .randomBytes(32)
      .toString('hex')
      .substring(0, 64);

    // Update page with custom domain
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        customDomain: domain,
        customDomainStatus: 'PENDING',
        customDomainVerificationToken: verificationToken,
        customDomainVerifiedAt: null,
      },
    });

    logger.info(`Custom domain set for page ${pageId}: ${domain}`);

    return NextResponse.json({
      customDomain: updatedPage.customDomain,
      customDomainStatus: updatedPage.customDomainStatus,
      verificationToken,
      message: 'Domain added successfully. Please configure DNS records.',
    });
  } catch (error) {
    logger.error('Error setting custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to set custom domain' },
      { status: 500 }
    );
  }
}

// PUT: Update custom domain (currently same as POST)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  return POST(req, { params });
}

// DELETE: Remove custom domain
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
        customDomain: null,
        customDomainStatus: null,
        customDomainVerifiedAt: null,
        customDomainVerificationToken: null,
      },
    });

    logger.info(`Custom domain removed for page ${pageId}`);

    return NextResponse.json({ message: 'Domain removed successfully' });
  } catch (error) {
    logger.error('Error removing custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to remove custom domain' },
      { status: 500 }
    );
  }
}
