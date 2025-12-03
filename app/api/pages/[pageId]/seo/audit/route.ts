/**
 * GET /api/pages/[pageId]/seo/audit - Get SEO audit results for a page
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auditPageSEO } from '@/lib/seo/seoAudit';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch page with related data
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        blocks: {
          select: {
            type: true,
            title: true,
            description: true
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

    // Verify ownership
    if (page.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';
    const pageUrl = page.customDomain 
      ? `https://${page.customDomain}`
      : page.subdomain
        ? `${baseUrl}/p/${page.subdomain}`
        : undefined;

    // Perform SEO audit
    const auditResult = auditPageSEO({
      title: page.title,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      description: page.description,
      ogImage: page.ogImage,
      url: pageUrl,
      customDomain: page.customDomain || undefined,
      subdomain: page.subdomain || undefined,
      blocks: page.blocks,
      user: {
        profile: {
          displayName: page.user.profile?.displayName || undefined,
          bio: page.user.profile?.bio || undefined
        }
      }
    });

    return NextResponse.json({
      audit: auditResult
    });
  } catch (error) {
    console.error('Error performing SEO audit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


