/**
 * GET /api/templates/performance - Get template performance analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const templateId = searchParams.get('templateId');
    const pageId = searchParams.get('pageId');
    const timeRange = searchParams.get('timeRange') || '30d';

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
    }

    const where: any = {
      userId,
      date: {
        gte: startDate
      }
    };

    if (templateId) where.templateId = templateId;
    if (pageId) where.pageId = pageId;

    // Fetch performance data
    const performanceData = await prisma.templatePerformance.findMany({
      where,
      orderBy: {
        date: 'asc'
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        }
      }
    });

    // Format response
    const performance = performanceData.map(p => ({
      date: p.date.toISOString().split('T')[0],
      templateId: p.templateId,
      templateName: p.template.name,
      views: p.views,
      clicks: p.clicks,
      conversions: p.conversions,
      conversionRate: p.conversionRate ? Number(p.conversionRate) : undefined,
      engagementTime: p.engagementTime,
      bounceRate: p.bounceRate ? Number(p.bounceRate) : undefined,
      revenue: Number(p.revenue)
    }));

    // Calculate summary
    const summary = {
      totalViews: performance.reduce((sum, p) => sum + p.views, 0),
      totalClicks: performance.reduce((sum, p) => sum + p.clicks, 0),
      totalConversions: performance.reduce((sum, p) => sum + p.conversions, 0),
      totalRevenue: performance.reduce((sum, p) => sum + p.revenue, 0),
      avgConversionRate: performance.length > 0
        ? performance.reduce((sum, p) => sum + (p.conversionRate || 0), 0) / performance.length
        : 0,
      avgEngagementTime: performance.length > 0
        ? Math.round(performance.reduce((sum, p) => sum + (p.engagementTime || 0), 0) / performance.length)
        : 0
    };

    return NextResponse.json({
      performance,
      summary
    });
  } catch (error) {
    console.error('Error fetching template performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






