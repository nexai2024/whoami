import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

// POST: Create new email subscriber
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, pageId, blockId, pageType, userId, name, tags } = body;

    // Validation
    if (!email || !pageId || !pageType || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, pageId, pageType, userId' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if subscriber already exists for this page
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: {
        pageId_email: {
          pageId,
          email: normalizedEmail,
        },
      },
    });

    if (existingSubscriber) {
      // Update metadata if needed
      await prisma.emailSubscriber.update({
        where: { id: existingSubscriber.id },
        data: {
          pageType,
          userId,
          source: blockId ?? existingSubscriber.source,
          ...(name ? { name } : {}),
          ...(Array.isArray(tags) && tags.length
            ? { tags: Array.from(new Set([...(existingSubscriber.tags ?? []), ...tags])) }
            : {}),
        },
      });

      // Return success but indicate already subscribed
      return NextResponse.json(
        {
          success: true,
          message: 'Already subscribed',
          subscriber: {
            id: existingSubscriber.id,
            email: existingSubscriber.email,
            subscribedAt: existingSubscriber.createdAt,
          },
        },
        { status: 200 }
      );
    }

    // Create new subscriber
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: normalizedEmail,
        pageId,
        pageType,
        userId,
        name: name || null,
        source: blockId ?? null, // Store blockId in source field
        tags: Array.isArray(tags) ? tags : [],
        isActive: true,
      },
    });

    logger.info('Email subscriber created:', { email, pageId, blockId });

    // Trigger workflows for new subscriber
    try {
      const { WorkflowExecutionService } = await import('@/lib/services/workflowExecutionService');
      await WorkflowExecutionService.triggerWorkflows('NEW_SUBSCRIBER', {
        email: normalizedEmail,
        name: name || null,
        pageId,
        pageType,
        userId,
        subscriberId: subscriber.id,
        tags: subscriber.tags,
      });
    } catch (error) {
      // Log but don't fail the subscription
      logger.error('Error triggering workflows for new subscriber:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Subscribed successfully',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          subscribedAt: subscriber.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating email subscriber:', error);

    // Handle Prisma unique constraint errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: true,
          message: 'Already subscribed',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to subscribe. Please try again.',
      },
      { status: 500 }
    );
  }
}
