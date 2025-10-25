/**
 * GET /api/courses/[courseId]/progress - Get progress
 * POST /api/courses/[courseId]/progress - Update progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Get enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_email: {
          courseId,
          email
        }
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

    return NextResponse.json({
      enrollment,
      progress: enrollment.lessonProgress
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
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const body = await request.json();
    const {
      email,
      lessonId,
      status,
      progressPercent,
      timeSpent,
      lastPosition,
      notes,
      quizScore
    } = body;

    if (!email || !lessonId) {
      return NextResponse.json(
        { error: 'Email and lessonId required' },
        { status: 400 }
      );
    }

    // Get enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        courseId_email: {
          courseId,
          email
        }
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
