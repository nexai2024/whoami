/**
 * GET /api/courses/[courseId] - Get course details
 * PUT /api/courses/[courseId] - Update course
 * DELETE /api/courses/[courseId] - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            resources: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (course.status !== 'PUBLISHED' && course.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      tags,
      level,
      estimatedTime,
      coverImageUrl,
      promoVideoUrl,
      accessType,
      price,
      isLeadMagnet,
      requiresEmail,
      status,
      metaTitle,
      metaDescription
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (level !== undefined) updateData.level = level;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (promoVideoUrl !== undefined) updateData.promoVideoUrl = promoVideoUrl;
    if (accessType !== undefined) updateData.accessType = accessType;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (isLeadMagnet !== undefined) updateData.isLeadMagnet = isLeadMagnet;
    if (requiresEmail !== undefined) updateData.requiresEmail = requiresEmail;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prevent deletion if there are enrollments
    if (existing._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Archive it instead.' },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
