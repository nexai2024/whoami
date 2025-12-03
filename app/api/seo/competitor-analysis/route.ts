/**
 * POST /api/seo/competitor-analysis - Analyze competitor SEO
 * Compares your page SEO against competitor URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auditPageSEO } from '@/lib/seo/seoAudit';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { pageId, competitorUrls } = body;

    if (!pageId || !competitorUrls || !Array.isArray(competitorUrls)) {
      return NextResponse.json(
        { error: 'Missing pageId or competitorUrls array' },
        { status: 400 }
      );
    }

    // Fetch your page data
    const yourPage = await prisma.page.findUnique({
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

    if (!yourPage || yourPage.userId !== userId) {
      return NextResponse.json(
        { error: 'Page not found or unauthorized' },
        { status: 404 }
      );
    }

    // Audit your page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';
    const yourPageUrl = yourPage.customDomain 
      ? `https://${yourPage.customDomain}`
      : yourPage.subdomain
        ? `${baseUrl}/p/${yourPage.subdomain}`
        : undefined;

    const yourAudit = auditPageSEO({
      title: yourPage.title,
      metaTitle: yourPage.metaTitle,
      metaDescription: yourPage.metaDescription,
      metaKeywords: yourPage.metaKeywords,
      description: yourPage.description,
      ogImage: yourPage.ogImage,
      url: yourPageUrl,
      customDomain: yourPage.customDomain || undefined,
      subdomain: yourPage.subdomain || undefined,
      blocks: yourPage.blocks,
      user: {
        profile: {
          displayName: yourPage.user.profile?.displayName || undefined,
          bio: yourPage.user.profile?.bio || undefined
        }
      }
    });

    // Analyze competitors (simplified - in production, you'd fetch and parse their HTML)
    const competitorAnalyses = await Promise.all(
      competitorUrls.slice(0, 5).map(async (url: string) => {
        try {
          // In production, fetch the URL and extract SEO data
          // For now, return a placeholder analysis
          return {
            url,
            title: 'Competitor Page',
            metaDescription: 'Competitor description',
            score: Math.floor(Math.random() * 30) + 70, // Placeholder score
            strengths: ['Strong title', 'Good meta description'],
            weaknesses: ['Missing schema', 'No keywords']
          };
        } catch (error) {
          return {
            url,
            error: 'Failed to analyze'
          };
        }
      })
    );

    // Compare scores
    const averageCompetitorScore = competitorAnalyses
      .filter(c => c.score)
      .reduce((sum, c) => sum + (c.score || 0), 0) / competitorAnalyses.filter(c => c.score).length;

    const comparison = {
      yourScore: yourAudit.score,
      averageCompetitorScore: Math.round(averageCompetitorScore),
      difference: yourAudit.score - averageCompetitorScore,
      status: yourAudit.score >= averageCompetitorScore ? 'ahead' : 'behind'
    };

    return NextResponse.json({
      yourPage: {
        score: yourAudit.score,
        issues: yourAudit.issues.length,
        recommendations: yourAudit.recommendations
      },
      competitors: competitorAnalyses,
      comparison,
      insights: generateInsights(yourAudit, competitorAnalyses, comparison)
    });
  } catch (error) {
    console.error('Error in competitor analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateInsights(yourAudit: any, competitors: any[], comparison: any): string[] {
  const insights: string[] = [];

  if (comparison.status === 'ahead') {
    insights.push(`You're ahead of competitors by ${comparison.difference} points!`);
  } else {
    insights.push(`You're ${Math.abs(comparison.difference)} points behind competitors.`);
  }

  if (yourAudit.errors > 0) {
    insights.push(`Fix ${yourAudit.errors} critical SEO errors to improve your score.`);
  }

  if (!yourAudit.issues.some((i: any) => i.field === 'ogImage')) {
    insights.push('Your Open Graph image is set - great for social sharing!');
  }

  return insights;
}


