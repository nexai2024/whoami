/**
 * GET /api/courses/[courseId]/reviews - Get course reviews
 * POST /api/courses/[courseId]/reviews - Submit a course review
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
    const searchParams = request.nextUrl.searchParams;
    const approvedOnly = searchParams.get('approved') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured') === 'true';

    const where: any = { courseId };
    if (approvedOnly) {
      where.approved = true;
    }
    if (featured) {
      where.featured = true;
    }

    const reviews = await prisma.courseReview.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    });

    // Calculate average rating
    const allApprovedReviews = await prisma.courseReview.findMany({
      where: { courseId, approved: true },
      select: { rating: true }
    });

    const averageRating = allApprovedReviews.length > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / allApprovedReviews.length
      : 0;

    const ratingDistribution = {
      5: allApprovedReviews.filter(r => r.rating === 5).length,
      4: allApprovedReviews.filter(r => r.rating === 4).length,
      3: allApprovedReviews.filter(r => r.rating === 3).length,
      2: allApprovedReviews.filter(r => r.rating === 2).length,
      1: allApprovedReviews.filter(r => r.rating === 1).length,
    };

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: allApprovedReviews.length,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
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
    const body = await request.json();
    const { email, name, rating, comment } = body;

    if (!email || !rating) {
      return NextResponse.json(
        { error: 'Email and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled (optional - can allow reviews from anyone)
    // For now, we'll allow anyone to review, but you can add enrollment check if needed

    // Create review (defaults to not approved, needs moderation)
    const review = await prisma.courseReview.create({
      data: {
        courseId,
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        rating,
        comment: comment?.trim() || null,
        approved: false, // Require moderation
      }
    });

    // Update course average rating
    const allApprovedReviews = await prisma.courseReview.findMany({
      where: { courseId, approved: true },
      select: { rating: true }
    });

    const averageRating = allApprovedReviews.length > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / allApprovedReviews.length
      : rating;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100
      }
    });

    return NextResponse.json({
      review,
      message: 'Review submitted successfully. It will be visible after moderation.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

