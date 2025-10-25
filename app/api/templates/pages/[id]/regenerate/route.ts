/**
 * POST /api/templates/pages/[id]/regenerate - Regenerate specific template section using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { regenerateTemplateSection } from '@/lib/services/aiService';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { section, blockIndex, prompt, applyToTemplate } = body;

    // Validate required fields
    if (!section || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: section, prompt' },
        { status: 400 }
      );
    }

    // Validate section type
    if (!['header', 'block'].includes(section)) {
      return NextResponse.json(
        { error: 'Invalid section. Must be "header" or "block"' },
        { status: 400 }
      );
    }

    // For block regeneration, blockIndex is required
    if (section === 'block' && blockIndex === undefined) {
      return NextResponse.json(
        { error: 'blockIndex is required for block regeneration' },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await prisma.pageTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership for modification
    if (applyToTemplate && template.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied - you can only modify your own templates' },
        { status: 403 }
      );
    }

    // Prepare template data for AI
    const currentTemplate = {
      name: template.name,
      category: template.category,
      templateType: template.templateType,
      headerData: template.headerData as any,
      blocksData: (template.blocksData as any[]) || []
    };

    // Regenerate section using AI
    const regeneratedSection = await regenerateTemplateSection({
      currentTemplate,
      section,
      blockIndex: blockIndex !== undefined ? parseInt(blockIndex) : undefined,
      prompt
    });

    // If applyToTemplate is true, update the template
    if (applyToTemplate) {
      const updateData: any = {};

      if (section === 'header') {
        updateData.headerData = regeneratedSection;
      } else if (section === 'block') {
        const blocksData = [...currentTemplate.blocksData];
        blocksData[blockIndex] = regeneratedSection;
        updateData.blocksData = blocksData;
      }

      const updatedTemplate = await prisma.pageTemplate.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json({
        success: true,
        applied: true,
        regeneratedSection,
        template: {
          id: updatedTemplate.id,
          updatedAt: updatedTemplate.updatedAt.toISOString()
        }
      });
    }

    // Return regenerated section without applying
    return NextResponse.json({
      success: true,
      applied: false,
      regeneratedSection
    });
  } catch (error) {
    console.error('Error regenerating template section:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 503 }
        );
      }
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: error.message },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to regenerate template section' },
      { status: 500 }
    );
  }
}
