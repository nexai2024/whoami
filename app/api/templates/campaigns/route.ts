/**
 * GET /api/templates/campaigns - List campaign templates
 * POST /api/templates/campaigns - Create campaign template
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const myTemplates = searchParams.get('myTemplates') === 'true';

    const where: any = {};

    if (myTemplates) {
      where.userId = userId;
    } else {
      where.OR = [
        { isPublic: true },
        { userId }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.featured = true;
    }

    const templates = await prisma.campaignTemplate.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { useCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        goal: template.goal,
        targetAudience: template.targetAudience,
        platforms: template.platforms,
        tone: template.tone,
        category: template.category,
        useCount: template.useCount,
        featured: template.featured,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching campaign templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      goal,
      targetAudience,
      platforms,
      tone,
      category,
      isPublic,
      campaignId // If creating from existing campaign
    } = body;

    // Validation
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 3-100 characters' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    let templateData: any = {
      userId,
      name,
      description,
      goal,
      targetAudience,
      platforms: platforms || [],
      tone,
      category,
      isPublic: isPublic || false
    };

    // If creating from existing campaign, fetch campaign data
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      if (campaign.userId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      templateData = {
        ...templateData,
        name: name || `${campaign.name} Template`,
        goal: goal || campaign.goal,
        targetAudience: targetAudience || campaign.targetAudience
      };
    }

    const template = await prisma.campaignTemplate.create({
      data: templateData
    });

    return NextResponse.json({
      templateId: template.id,
      message: 'Campaign template created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
