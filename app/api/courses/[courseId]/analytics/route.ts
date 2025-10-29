import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        },
        enrollments: {
          include: {
            courseProgress: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this course analytics' },
        { status: 403 }
      );
    }

    // Calculate analytics
    const enrollmentCount = course.enrollments.length;

    // Completion rate: students with 100% progress
    const completedCount = course.enrollments.filter((enrollment: { courseProgress: { overallProgress: number; }; }) =>
      enrollment.courseProgress && enrollment.courseProgress.overallProgress === 100
    ).length;
    const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0;

    // Average progress across all students
    const totalProgress = course.enrollments.reduce((sum: number, enrollment: { courseProgress: { overallProgress: number; }; }) =>
      sum + (enrollment.courseProgress?.overallProgress || 0), 0
    );
    const averageProgress = enrollmentCount > 0 ? totalProgress / enrollmentCount : 0;

    // Revenue calculation (for paid courses)
    const revenue = course.accessType === 'PAID' && course.price
      ? enrollmentCount * course.price
      : 0;

    // Lesson completion breakdown
    const lessonBreakdown = course.lessons.map((lesson: { title: any; id: any; }) => {
      const completedInLesson = course.enrollments.filter((enrollment: { courseProgress: { lessonsCompleted: any; }; }) =>
        enrollment.courseProgress?.lessonsCompleted?.includes(lesson.id)
      ).length;

      return {
        title: lesson.title,
        completionRate: enrollmentCount > 0 ? (completedInLesson / enrollmentCount) * 100 : 0,
        completedCount: completedInLesson
      };
    });

    return NextResponse.json({
      courseTitle: course.title,
      enrollmentCount,
      completionRate,
      averageProgress,
      revenue,
      lessonBreakdown
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
