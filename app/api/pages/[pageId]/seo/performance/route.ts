/**
 * GET /api/pages/[pageId]/seo/performance - Get SEO performance history
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auditPageSEO } from '@/lib/seo/seoAudit';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch page
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

    if (!page || page.userId !== userId) {
      return NextResponse.json(
        { error: 'Page not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2020); // Far back date
        break;
    }

    // Fetch historical performance data
    const historicalData = await prisma.sEOPerformance.findMany({
      where: {
        pageId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get current audit
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';
    const pageUrl = page.customDomain 
      ? `https://${page.customDomain}`
      : page.subdomain
        ? `${baseUrl}/p/${page.subdomain}`
        : undefined;

    const currentAudit = auditPageSEO({
      title: page.title ?? undefined,
      metaTitle: page.metaTitle ?? undefined,
      metaDescription: page.metaDescription ?? undefined,
      metaKeywords: page.metaKeywords ?? undefined,
      description: page.description ?? undefined,
      ogImage: page.ogImage ?? undefined,
      url: pageUrl,
      customDomain: page.customDomain ?? undefined,
      subdomain: page.subdomain ?? undefined,
      blocks: page.blocks.map((block) => ({
        type: block.type,
        title: block.title ?? undefined,
        description: block.description ?? undefined,
      })),
      user: {
        profile: {
          displayName: page.user.profile?.displayName || undefined,
          bio: page.user.profile?.bio || undefined
        }
      }
    });

    // Save current performance if not exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.sEOPerformance.upsert({
      where: {
        pageId_date: {
          pageId,
          date: today
        }
      },
      create: {
        pageId,
        userId,
        date: today,
        score: currentAudit.score,
        errors: currentAudit.errors,
        warnings: currentAudit.warnings,
        info: currentAudit.passed,
        issues: currentAudit.issues as any
      },
      update: {
        score: currentAudit.score,
        errors: currentAudit.errors,
        warnings: currentAudit.warnings,
        info: currentAudit.passed,
        issues: currentAudit.issues as any
      }
    });

    // Format response
    const performance = historicalData.map((p: { date: any; score: any; errors: any; warnings: any; info: any; organicTraffic: any; impressions: any; clicks: any; ctr: any; }) => ({
      date: p.date.toISOString().split('T')[0],
      score: p.score,
      errors: p.errors,
      warnings: p.warnings,
      info: p.info,
      organicTraffic: p.organicTraffic,
      impressions: p.impressions,
      clicks: p.clicks,
      ctr: p.ctr ? Number(p.ctr) : undefined
    }));

    // Add today's data if not in historical
    const todayStr = today.toISOString().split('T')[0];
    if (!performance.some((p: { date: any; }) => p.date === todayStr)) {
      performance.push({
        date: todayStr,
        score: currentAudit.score,
        errors: currentAudit.errors,
        warnings: currentAudit.warnings,
        info: currentAudit.passed,
        organicTraffic: 0,
        impressions: 0,
        clicks: 0,
        ctr: undefined
      });
    }

    return NextResponse.json({
      performance: performance.sort((a: { date: any; }, b: { date: any; }) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      currentScore: currentAudit.score
    });
  } catch (error) {
    console.error('Error fetching SEO performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






