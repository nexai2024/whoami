import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

// POST: Create new email subscriber
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, pageId, blockId } = body;

    // Validation
    if (!email || !pageId || !blockId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, pageId, blockId' },
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

    // Check if subscriber already exists for this page
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: {
        pageId_email: {
          pageId,
          email,
        },
      },
    });

    if (existingSubscriber) {
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
        email,
        pageId,
        source: blockId, // Store blockId in source field
        isActive: true,
      },
    });

    logger.info('Email subscriber created:', { email, pageId, blockId });

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
  } catch (error) {
    logger.error('Error creating email subscriber:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
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
