import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/availability/blackouts?userId=xxx
 * List blackout dates for a user (coach)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const requestedUserId = targetUserId || userId;

    if (!requestedUserId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: any = { userId: requestedUserId };

    // Optional date filtering
    if (startDate || endDate) {
      if (startDate && endDate) {
        // Find blackouts that overlap with the date range
        where.OR = [
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
        ];
      } else if (startDate) {
        where.endDate = { gte: new Date(startDate) };
      } else if (endDate) {
        where.startDate = { lte: new Date(endDate) };
      }
    }

    const blackouts = await prisma.blackoutDate.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ blackouts });
  } catch (error) {
    logger.error('Error fetching blackout dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability/blackouts
 * Create a new blackout date
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { startDate, endDate, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'endDate must be after startDate' },
        { status: 400 }
      );
    }

    // Check for overlapping blackout dates
    const overlaps = await prisma.blackoutDate.findMany({
      where: {
        userId,
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
        ],
      },
    });

    if (overlaps.length > 0) {
      return NextResponse.json(
        { error: 'Blackout date overlaps with existing blackout' },
        { status: 409 }
      );
    }

    const blackout = await prisma.blackoutDate.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        reason: reason || null,
      },
    });

    logger.info('Blackout date created', {
      blackoutId: blackout.id,
      userId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    return NextResponse.json({ blackout }, { status: 201 });
  } catch (error) {
    logger.error('Error creating blackout date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
