/**
 * GET /api/courses - List courses
 * POST /api/courses - Create new course
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { handleApiError, successResponse } from '@/lib/utils/apiError';
import { validateRequest, courseSchema } from '@/lib/utils/validation';
import { CourseStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Try to get authenticated user (optional for public access)
    // For GET requests, we allow public access, so we use getAuthenticatedUser instead
    const { getAuthenticatedUser } = await import('@/lib/auth/serverAuth');
    const auth = await getAuthenticatedUser(request);
    const userId = auth?.userId || null;
    
    const status = searchParams.get('status');
    const isLeadMagnet = searchParams.get('isLeadMagnet');

    const where: {
      userId?: string;
      status?: CourseStatus;
      isLeadMagnet?: boolean;
    } = {};

    // For authenticated users in admin/management area, only show their own courses
    // Public marketplace should use /api/courses/public endpoint
    if (userId) {
      where.userId = userId; // Only show courses owned by the user
    } else {
      // If no userId, only show published courses (for public access)
      where.status = CourseStatus.PUBLISHED;
    }

    // Apply status filter if provided (only applies to user's own courses)
    if (status && userId) {
      // Validate status is a valid CourseStatus enum value
      if (Object.values(CourseStatus).includes(status as CourseStatus)) {
        where.status = status as CourseStatus;
      }
    }

    if (isLeadMagnet === 'true') {
      where.isLeadMagnet = true;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            contentType: true,
            videoLength: true,
            isFree: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse({ courses });
  } catch (error) {
    return handleApiError(error, 'GET /api/courses');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    
    if ('authorized' in auth && !auth.authorized) {
      return handleApiError(new Error(auth.error || 'Unauthorized'), 'POST /api/courses');
    }

    const userId = 'userId' in auth ? auth.userId : null;
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), 'POST /api/courses');
    }

    // Validate request body
    const validation = await validateRequest(request, courseSchema.extend({
      slug: courseSchema.shape.slug.optional()
    }));
    
    if (!validation.success) {
      return handleApiError(validation.error, 'POST /api/courses');
    }

    const courseData = validation.data;

    // Check slug uniqueness if provided
    if (courseData.slug) {
      const existing = await prisma.course.findUnique({
        where: { slug: courseData.slug }
      });

      if (existing) {
        return handleApiError(new Error('Slug already exists'), 'POST /api/courses');
      }
    }

    // Prepare course data for Prisma
    // Only include slug if it's provided (not undefined)
    const createData: any = {
      userId,
      title: courseData.title,
      description: courseData.description || null,
      category: courseData.category || null,
      tags: courseData.tags || [],
      level: courseData.level,
      estimatedTime: courseData.estimatedTime || null,
      language: courseData.language,
      coverImageUrl: courseData.coverImageUrl || null,
      promoVideoUrl: courseData.promoVideoUrl || null,
      accessType: courseData.accessType,
      price: courseData.price || null,
      currency: courseData.currency,
      isLeadMagnet: courseData.isLeadMagnet,
      requiresEmail: courseData.requiresEmail,
      status: CourseStatus.DRAFT
    };

    // Only add slug if it's provided
    if (courseData.slug) {
      createData.slug = courseData.slug;
    }

    const course = await prisma.course.create({
      data: createData,
      include: {
        lessons: true
      }
    });

    return successResponse({ course }, 201);
  } catch (error) {
    return handleApiError(error, 'POST /api/courses');
  }
}
