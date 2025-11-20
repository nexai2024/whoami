/**
 * GET /api/courses/[courseId]/progress - Get progress
 * POST /api/courses/[courseId]/progress - Update progress
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

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get enrollment by userId
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        userId
      },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true
              }
            }
          },
          orderBy: {
            lesson: {
              order: 'asc'
            }
          }
        },
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                order: true,
                contentType: true,
                videoLength: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Format response for compatibility with frontend
    const lessonsCompleted = enrollment.lessonProgress
      .filter(p => p.status === 'COMPLETED')
      .map(p => p.lessonId);

    return NextResponse.json({
      enrolledAt: enrollment.createdAt,
      lessonsCompleted,
      currentLessonIndex: lessonsCompleted.length,
      overallProgress: enrollment.progressPercentage
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const {
      lessonId,
      status,
      progressPercent,
      timeSpent,
      lastPosition,
      notes,
      quizScore
    } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'Authentication and lessonId required' },
        { status: 400 }
      );
    }

    // Get enrollment by userId
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        userId
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update or create lesson progress
    const updateData: any = {};
    if (status) updateData.status = status;
    if (progressPercent !== undefined) updateData.progressPercent = progressPercent;
    if (timeSpent !== undefined) {
      updateData.timeSpent = { increment: timeSpent };
    }
    if (lastPosition !== undefined) updateData.lastPosition = lastPosition;
    if (notes !== undefined) updateData.notes = notes;
    if (quizScore !== undefined) updateData.quizScore = quizScore;

    // Mark as completed if status is COMPLETED
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.progressPercent = 100;
    }

    const progress = await prisma.courseLessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      update: {
        ...updateData,
        viewCount: { increment: 1 }
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        status: status || 'IN_PROGRESS',
        progressPercent: progressPercent || 0,
        timeSpent: timeSpent || 0,
        lastPosition: lastPosition || 0,
        notes,
        quizScore,
        viewCount: 1
      }
    });

    // Update enrollment progress
    const allProgress = await prisma.courseLessonProgress.findMany({
      where: { enrollmentId: enrollment.id }
    });

    const completedCount = allProgress.filter(p => p.status === 'COMPLETED').length;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { lessons: { select: { id: true } } }
    });

    const totalLessons = course?.lessons.length || 1;
    const overallProgress = Math.round((completedCount / totalLessons) * 100);

    const isCompleted = completedCount === totalLessons;

    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage: overallProgress,
        currentLessonId: lessonId,
        lastAccessedAt: new Date(),
        totalTimeSpent: { increment: timeSpent || 0 },
        ...(isCompleted && !enrollment.completedAt ? { completedAt: new Date() } : {})
      }
    });

    // Trigger workflows for lesson completion
    if (status === 'COMPLETED') {
      try {
        const { WorkflowExecutionService } = await import('@/lib/services/workflowExecutionService');
        await WorkflowExecutionService.triggerWorkflows('LESSON_COMPLETED', {
          email: enrollment.email,
          name: enrollment.name || null,
          courseId: courseId,
          lessonId: lessonId,
          enrollmentId: enrollment.id,
          userId: enrollment.userId || null,
        });
      } catch (error) {
        console.error('Error triggering workflows for lesson completion:', error);
      }
    }

    // Trigger workflows for course completion
    if (isCompleted && !enrollment.completedAt) {
      try {
        const { WorkflowExecutionService } = await import('@/lib/services/workflowExecutionService');
        await WorkflowExecutionService.triggerWorkflows('COURSE_COMPLETED', {
          email: enrollment.email,
          name: enrollment.name || null,
          courseId: courseId,
          enrollmentId: enrollment.id,
          userId: enrollment.userId || null,
        });
      } catch (error) {
        console.error('Error triggering workflows for course completion:', error);
      }
    }

    return NextResponse.json({
      progress,
      overallProgress,
      completedLessons: completedCount,
      totalLessons
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
