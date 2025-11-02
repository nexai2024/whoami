/**
 * POST /api/courses/[courseId]/enroll - Enroll in course
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Course is not published' },
        { status: 400 }
      );
    }

    // Check if already enrolled (by userId if authenticated, or by email)
    const existingEnrollment = userId
      ? await prisma.courseEnrollment.findFirst({
          where: {
            courseId,
            userId
          }
        })
      : await prisma.courseEnrollment.findUnique({
          where: {
            courseId_email: {
              courseId,
              email
            }
          }
        });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          error: 'Already enrolled',
          enrollment: existingEnrollment
        },
        { status: 400 }
      );
    }

    // Check if payment is required for paid courses
    if (course.accessType === 'PAID' && !body.paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment required for this course' },
        { status: 402 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        userId: userId || null,
        email,
        name,
        enrollmentSource: body.source || 'direct',
        paymentStatus: course.accessType === 'PAID' ? 'completed' : null,
        paymentAmount: course.accessType === 'PAID' ? course.price : null,
        stripePaymentId: body.paymentIntentId || null,
        currentLessonId: course.lessons[0]?.id || null
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            coverImageUrl: true
          }
        }
      }
    });

    // Update enrollment count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCount: {
          increment: 1
        }
      }
    });

    // Add to email subscriber if it's a lead magnet
    if (course.isLeadMagnet && course.requiresEmail) {
      await prisma.emailSubscriber.upsert({
        where: {
          pageId_email: {
            pageId: 'lead-magnet', // You may want to link this to actual page
            email
          }
        },
        create: {
          pageId: 'lead-magnet',
          email,
          name,
          source: `course:${courseId}`,
          tags: ['course-enrolled', `course-${course.slug}`]
        },
        update: {
          tags: {
            push: ['course-enrolled', `course-${course.slug}`]
          }
        }
      });
    }

    return NextResponse.json({
      enrollment,
      message: 'Successfully enrolled in course'
    }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}
