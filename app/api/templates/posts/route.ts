/**
 * GET /api/templates/posts - List post templates
 * POST /api/templates/posts - Create post template
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform, PostType } from '@prisma/client';

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
    const platform = searchParams.get('platform') as Platform | null;
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

    if (platform) {
      where.platform = platform;
    }

    if (featured) {
      where.featured = true;
    }

    const templates = await prisma.postTemplate.findMany({
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
        content: template.content,
        platform: template.platform,
        postType: template.postType,
        mediaUrls: template.mediaUrls,
        category: template.category,
        useCount: template.useCount,
        featured: template.featured,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching post templates:', error);
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
      content,
      platform,
      postType,
      mediaUrls,
      category,
      isPublic
    } = body;

    // Validation
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 3-100 characters' },
        { status: 400 }
      );
    }

    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!platform || !Object.values(Platform).includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    if (!postType || !Object.values(PostType).includes(postType)) {
      return NextResponse.json(
        { error: 'Invalid post type' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const template = await prisma.postTemplate.create({
      data: {
        userId,
        name,
        description,
        content,
        platform,
        postType,
        mediaUrls: mediaUrls || [],
        category,
        isPublic: isPublic || false
      }
    });

    return NextResponse.json({
      templateId: template.id,
      message: 'Post template created successfully'
    });
  } catch (error) {
    console.error('Error creating post template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
