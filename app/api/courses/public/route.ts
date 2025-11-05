/**
 * GET /api/courses/public - List all published courses (public marketplace)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const accessType = searchParams.get('accessType'); // FREE, PAID, EMAIL_GATE
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, popular, rating, price
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED'
    };

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (accessType) {
      where.accessType = accessType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default: newest
    if (sortBy === 'popular') {
      orderBy = { enrollmentCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (sortBy === 'price') {
      orderBy = { price: 'asc' };
    }

    // Fetch courses with instructor info
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          category: true,
          level: true,
          accessType: true,
          price: true,
          currency: true,
          coverImageUrl: true,
          enrollmentCount: true,
          averageRating: true,
          estimatedTime: true,
          publishedAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  displayName: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        }
      }),
      prisma.course.count({ where })
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
