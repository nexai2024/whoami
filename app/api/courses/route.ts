/**
 * GET /api/courses - List courses
 * POST /api/courses - Create new course
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    const status = searchParams.get('status');
    const isLeadMagnet = searchParams.get('isLeadMagnet');

    const where: any = {};

    // Filter by user (can view own courses or published public courses)
    if (userId) {
      where.OR = [
        { userId },
        { status: 'PUBLISHED' }
      ];
    } else {
      where.status = 'PUBLISHED';
    }

    if (status) {
      where.status = status;
    }

    if (isLeadMagnet === 'true') {
      where.isLeadMagnet = true;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            contentType: true,
            videoLength: true,
            isFree: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      slug,
      category,
      tags,
      level,
      estimatedTime,
      coverImageUrl,
      accessType,
      price,
      isLeadMagnet,
      requiresEmail
    } = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        userId,
        title,
        description,
        slug,
        category,
        tags: tags || [],
        level: level || 'BEGINNER',
        estimatedTime,
        coverImageUrl,
        accessType: accessType || 'FREE',
        price: price ? parseFloat(price) : null,
        isLeadMagnet: isLeadMagnet || false,
        requiresEmail: requiresEmail || false,
        status: 'DRAFT'
      },
      include: {
        lessons: true
      }
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
