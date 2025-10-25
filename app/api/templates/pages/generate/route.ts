/**
 * POST /api/templates/pages/generate - Generate template using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generatePageTemplate } from '@/lib/services/aiService';

const prisma = new PrismaClient();

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
    const { prompt, templateType, preferences, saveAsTemplate } = body;

    // Validate required fields
    if (!prompt || !templateType) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, templateType' },
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

    // Generate template using AI
    const generated = await generatePageTemplate({
      prompt,
      templateType,
      preferences: preferences || {}
    });

    // If saveAsTemplate is true, save to database
    let savedTemplate = null;
    if (saveAsTemplate) {
      // Generate placeholder thumbnail URL (user should upload real one)
      const thumbnailUrl = `/api/placeholder/template-thumbnail?name=${encodeURIComponent(generated.name)}`;

      savedTemplate = await prisma.pageTemplate.create({
        data: {
          userId,
          name: generated.name,
          description: generated.description || null,
          category: generated.category,
          tags: generated.suggestedTags || [],
          templateType,
          headerData: generated.headerData,
          blocksData: generated.blocksData || [],
          thumbnailUrl,
          isPublic: false,
          featured: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      generated: {
        name: generated.name,
        description: generated.description,
        category: generated.category,
        templateType,
        headerData: generated.headerData,
        blocksData: generated.blocksData || [],
        suggestedTags: generated.suggestedTags || []
      },
      savedTemplate: savedTemplate ? {
        id: savedTemplate.id,
        createdAt: savedTemplate.createdAt.toISOString()
      } : null
    });
  } catch (error) {
    console.error('Error generating template:', error);

    // Handle specific AI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 503 }
        );
      }
      if (error.message.includes('Generated template')) {
        return NextResponse.json(
          { error: error.message },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
