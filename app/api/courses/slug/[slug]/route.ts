import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.headers.get('x-user-id');

    // Fetch course with lessons (basic info only, no full content)
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            contentType: true,
            isFree: true,
            hasQuiz: true,
            videoLength: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (userId) {
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          userId,
          courseId: course.id
        }
      });
      isEnrolled = !!enrollment;
    }

    return NextResponse.json({
      ...course,
      isEnrolled
    });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
