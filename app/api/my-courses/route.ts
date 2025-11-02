/**
 * GET /api/my-courses - Get user's enrolled courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's enrollments with course details
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            coverImageUrl: true,
            level: true,
            estimatedTime: true,
          }
        }
      },
      orderBy: {
        lastAccessedAt: 'desc'
      }
    });

    return NextResponse.json({
      enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}

