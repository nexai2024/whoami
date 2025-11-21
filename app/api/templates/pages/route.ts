/**
 * GET /api/templates/pages - List page templates with filtering
 * POST /api/templates/pages - Create custom template (authenticated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TemplateType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');
    const templateType = searchParams.get('templateType') as TemplateType | null;
    const featured = searchParams.get('featured');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popular'; // popular, newest, rating
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = request.headers.get('x-user-id');

    // Build where clause
    const where: any = {
      OR: [
        { isPublic: true },
        ...(userId ? [{ userId }] : [])
      ]
    };

    if (category) {
      where.category = category;
    }

    if (industry) {
      where.industry = industry;
    }

    if (templateType) {
      where.templateType = templateType;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { industry: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Build orderBy based on sortBy parameter
    let orderBy: any[] = [];
    switch (sortBy) {
      case 'newest':
        orderBy = [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'rating':
        orderBy = [
          { featured: 'desc' },
          { rating: 'desc' },
          { useCount: 'desc' }
        ];
        break;
      case 'popular':
      default:
        orderBy = [
          { featured: 'desc' },
          { useCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    // Fetch templates with pagination
    const [templates, total] = await Promise.all([
      prisma.pageTemplate.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          industry: true,
          tags: true,
          templateType: true,
          thumbnailUrl: true,
          useCount: true,
          rating: true,
          featured: true,
          isPublic: true,
          userId: true,
          createdAt: true
        }
      }),
      prisma.pageTemplate.count({ where })
    ]);
console.log('templates', templates);
    return NextResponse.json({
      templates: templates.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching page templates:', error);
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

    // Validate required fields
    const { name, category, templateType, headerData, blocksData, thumbnailUrl, industry, theme } = body;

    if (!name || !category || !templateType || !headerData || !blocksData || !thumbnailUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, templateType, headerData, blocksData, thumbnailUrl' },
        { status: 400 }
      );
    }

    // Validate templateType
    if (!['BIO_ONLY', 'FULL_PAGE'].includes(templateType)) {
      return NextResponse.json(
        { error: 'Invalid templateType. Must be BIO_ONLY or FULL_PAGE' },
        { status: 400 }
      );
    }

    // Validate headerData has required headerStyle
    if (!headerData.headerStyle || !['minimal', 'card', 'gradient', 'split'].includes(headerData.headerStyle)) {
      return NextResponse.json(
        { error: 'Invalid or missing headerStyle in headerData' },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.pageTemplate.create({
      data: {
        userId,
        name,
        description: body.description || null,
        category,
        industry: industry || null,
        tags: body.tags || [],
        templateType,
        headerData,
        blocksData,
        theme: theme || null,
        thumbnailUrl,
        previewUrl: body.previewUrl || null,
        isPublic: body.isPublic || false,
        featured: false // Only admins can set featured
      }
    });

    return NextResponse.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating page template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
