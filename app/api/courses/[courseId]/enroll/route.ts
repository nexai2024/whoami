/**
 * POST /api/courses/[courseId]/enroll - Enroll in course
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { generateAccessToken, getTokenExpiration } from '@/lib/utils/courseAccess';
import { sendCourseEnrollmentConfirmation, sendCoachNewEnrollmentNotification } from '@/lib/services/emailService';

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

    const normalizedEmail = email.trim().toLowerCase();

    // Get course details with instructor info
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 1
        },
        user: {
          include: {
            profile: {
              select: {
                displayName: true,
                username: true
              }
            }
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
              email: normalizedEmail
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

    // Generate access token for guest users (non-authenticated)
    const accessToken = !userId ? generateAccessToken() : null;
    const accessTokenExpiresAt = !userId ? getTokenExpiration() : null;

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        userId: userId || null,
        email: normalizedEmail,
        name,
        enrollmentSource: body.source || 'direct',
        paymentStatus: course.accessType === 'PAID' ? 'completed' : null,
        paymentAmount: course.accessType === 'PAID' ? course.price : null,
        stripePaymentId: body.paymentIntentId || null,
        currentLessonId: course.lessons[0]?.id || null,
        accessToken,
        accessTokenExpiresAt
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
      const subscriberTags = ['course-enrolled', `course-${course.slug}`];
      const subscriberPageId = course.leadMagnetId || `course:${courseId}`;
      const subscriberPageType = course.leadMagnetId ? 'LEAD_MAGNET' : 'COURSE';

      const subscriberCreateData: Prisma.EmailSubscriberUncheckedCreateInput = {
        pageId: subscriberPageId,
        pageType: subscriberPageType,
        userId: course.userId,
        email: normalizedEmail,
        name,
        source: `course:${courseId}`,
        tags: subscriberTags,
      } as any;

      const subscriberUpdateData: Prisma.EmailSubscriberUncheckedUpdateInput = {
        pageType: subscriberPageType,
        userId: course.userId,
        tags: {
          push: subscriberTags,
        },
        source: `course:${courseId}`,
      } as any;

      await prisma.emailSubscriber.upsert({
        where: {
          pageId_email: {
            pageId: subscriberPageId,
            email: normalizedEmail
          }
        },
        create: subscriberCreateData,
        update: subscriberUpdateData,
      });
    }

    // Build access URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accessUrl = accessToken 
      ? `${baseUrl}/c/${course.slug}/learn?token=${accessToken}`
      : userId
      ? `${baseUrl}/c/${course.slug}/learn`
      : null;

    // Send enrollment confirmation email to student
    try {
      await sendCourseEnrollmentConfirmation(normalizedEmail, {
        recipientName: name || undefined,
        courseName: course.title,
        courseSlug: course.slug,
        accessUrl: accessUrl || undefined,
        instructorName: course.user?.profile?.displayName || course.user?.profile?.username || undefined,
        isPaid: course.accessType === 'PAID',
        price: course.price ? Number(course.price) : undefined
      });
    } catch (emailError) {
      console.error('Error sending enrollment confirmation email:', emailError);
      // Don't fail enrollment if email fails
    }

    // Send notification email to coach/instructor
    try {
      const coachEmail = course.user?.email;
      if (coachEmail) {
        await sendCoachNewEnrollmentNotification(coachEmail, {
          coachName: course.user?.profile?.displayName || course.user?.profile?.username || undefined,
          studentName: name || undefined,
          studentEmail: normalizedEmail,
          courseName: course.title,
          courseId: course.id,
          isPaid: course.accessType === 'PAID',
          price: course.price ? Number(course.price) : undefined,
          enrollmentDate: new Date()
        });
      }
    } catch (emailError) {
      console.error('Error sending coach notification email:', emailError);
      // Don't fail enrollment if email fails
    }

    // Trigger workflows for new course enrollment
    try {
      const { WorkflowExecutionService } = await import('@/lib/services/workflowExecutionService');
      await WorkflowExecutionService.triggerWorkflows('NEW_COURSE_ENROLLMENT', {
        email: normalizedEmail,
        name: name || null,
        courseId: course.id,
        courseTitle: course.title,
        enrollmentId: enrollment.id,
        userId: userId || null,
        accessToken: accessToken || null,
      });
    } catch (error) {
      // Log but don't fail the enrollment
      console.error('Error triggering workflows for course enrollment:', error);
    }

    return NextResponse.json({
      enrollment: {
        ...enrollment,
        accessUrl // Include access URL in response
      },
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
