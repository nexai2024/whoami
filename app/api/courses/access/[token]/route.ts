/**
 * GET /api/courses/access/[token] - Validate access token and get enrollment info
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isTokenExpired } from '@/lib/utils/courseAccess';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Find enrollment by access token
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { accessToken: token },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            coverImageUrl: true
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(enrollment.accessTokenExpiresAt)) {
      return NextResponse.json(
        { error: 'Access token has expired' },
        { status: 410 }
      );
    }

    // Check if access is revoked
    if (enrollment.accessRevoked) {
      return NextResponse.json(
        { error: 'Access has been revoked' },
        { status: 403 }
      );
    }

    // Check if course is still published
    if (enrollment.course.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Course is no longer available' },
        { status: 410 }
      );
    }

    // Update last accessed timestamp
    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() }
    });

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        email: enrollment.email,
        name: enrollment.name,
        courseId: enrollment.courseId,
        courseSlug: enrollment.course.slug,
        courseTitle: enrollment.course.title,
        progressPercentage: enrollment.progressPercentage
      }
    });
  } catch (error) {
    console.error('Error validating access token:', error);
    return NextResponse.json(
      { error: 'Failed to validate access token' },
      { status: 500 }
    );
  }
}
