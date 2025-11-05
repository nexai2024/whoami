import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/coaches/[coachSlug]
 * Get public coach profile by slug, including products and courses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachSlug: string }> }
) {
  try {
    const { coachSlug } = await params;

    // Find profile by coachSlug
    const profile = await prisma.profile.findUnique({
      where: { coachSlug },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    // Verify coach is enabled
    if (!profile.isCoach) {
      return NextResponse.json(
        { error: 'Coach profile not available' },
        { status: 404 }
      );
    }

    // Get coach's products (if productsEnabled)
    const products = profile.productsEnabled
      ? await prisma.product.findMany({
          where: {
            userId: profile.userId,
            isActive: true,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            fileUrl: true,
            createdAt: true,
          },
        })
      : [];

    // Get coach's published courses
    const courses = await prisma.course.findMany({
      where: {
        userId: profile.userId,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        coverImageUrl: true,
        accessType: true,
        price: true,
        createdAt: true,
      },
    });

    // Return coach profile data
    return NextResponse.json({
      coach: {
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatar: profile.avatar,
        coachSlug: profile.coachSlug,
        bookingEnabled: profile.bookingEnabled,
        productsEnabled: profile.productsEnabled,
      },
      products,
      courses,
    });
  } catch (error) {
    logger.error('Error fetching coach profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
