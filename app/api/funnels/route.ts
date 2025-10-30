import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/funnels - List all funnels for user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');

    const funnels = await prisma.funnel.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            order: true,
            views: true,
            completions: true,
          },
        },
        _count: {
          select: {
            visits: true,
            conversions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ funnels });
  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: 500 }
    );
  }
}

// POST /api/funnels - Create new funnel
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      slug,
      goalType,
      goalValue,
      conversionGoal,
      theme,
      brandColors,
    } = body;

    // Validate required fields
    if (!name || !slug || !goalType || !conversionGoal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existing = await prisma.funnel.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const funnel = await prisma.funnel.create({
      data: {
        userId,
        name,
        description,
        slug,
        goalType,
        goalValue,
        conversionGoal,
        theme: theme || {},
        brandColors: brandColors || {},
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ funnel }, { status: 201 });
  } catch (error) {
    console.error('Error creating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to create funnel' },
      { status: 500 }
    );
  }
}
