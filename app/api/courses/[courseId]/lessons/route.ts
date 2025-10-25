/**
 * GET /api/courses/[courseId]/lessons - List lessons
 * POST /api/courses/[courseId]/lessons - Create lesson
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

    const lessons = await prisma.courseLesson.findMany({
      where: { courseId },
      include: {
        resources: true,
        _count: {
          select: { progress: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
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
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      order,
      contentType,
      content,
      videoUrl,
      videoLength,
      audioUrl,
      hasQuiz,
      quizData,
      dripDay,
      isFree
    } = body;

    if (!title || order === undefined || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, order, contentType' },
        { status: 400 }
      );
    }

    const lesson = await prisma.courseLesson.create({
      data: {
        courseId,
        title,
        description,
        order,
        contentType,
        content,
        videoUrl,
        videoLength,
        audioUrl,
        hasQuiz: hasQuiz || false,
        quizData: quizData || null,
        dripDay,
        isFree: isFree || false,
        isPublished: true
      },
      include: {
        resources: true
      }
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
