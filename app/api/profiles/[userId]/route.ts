import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/profiles/[userId]
 * Get user profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authenticatedUserId = request.headers.get('x-user-id');

    // Users can only view their own profile
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profiles/[userId]
 * Update user profile (including coach settings)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const authenticatedUserId = request.headers.get('x-user-id');
    const body = await request.json();

    // Users can only update their own profile
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate coachSlug uniqueness if being set/changed
    if (body.coachSlug !== undefined) {
      const existingProfile = await prisma.profile.findFirst({
        where: {
          coachSlug: body.coachSlug,
          userId: { not: userId },
        },
      });

      if (existingProfile) {
        return NextResponse.json(
          { error: 'Coach slug already taken' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.website !== undefined) updateData.website = body.website || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.isCoach !== undefined) updateData.isCoach = body.isCoach;
    if (body.coachSlug !== undefined) updateData.coachSlug = body.coachSlug || null;
    if (body.bookingEnabled !== undefined) updateData.bookingEnabled = body.bookingEnabled;
    if (body.productsEnabled !== undefined) updateData.productsEnabled = body.productsEnabled;

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    logger.info('Profile updated', { userId, updates: Object.keys(updateData) });

    return NextResponse.json(profile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
