import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia'
});

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch course
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify course is paid and has a price
    if (course.accessType !== 'PAID' || !course.price) {
      return NextResponse.json(
        { error: 'This course is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description || undefined,
              images: course.coverImageUrl ? [course.coverImageUrl] : undefined
            },
            unit_amount: Math.round(course.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/c/${course.slug}/learn?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin')}/c/${course.slug}`,
      metadata: {
        userId,
        courseId: course.id
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
