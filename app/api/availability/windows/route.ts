import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/availability/windows?userId=xxx
 * List availability windows for a user (coach)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const isActive = searchParams.get('isActive');

    const requestedUserId = targetUserId || userId;

    if (!requestedUserId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: any = { userId: requestedUserId };

    if (dayOfWeek !== null && dayOfWeek !== undefined) {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const windows = await prisma.availabilityWindow.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ windows });
  } catch (error) {
    logger.error('Error fetching availability windows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability/windows
 * Create a new availability window
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, timezone, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (
      dayOfWeek === undefined ||
      dayOfWeek === null ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM (24-hour format)' },
        { status: 400 }
      );
    }

    // Validate start time is before end time
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: 'endTime must be after startTime' },
        { status: 400 }
      );
    }

    // Check for overlapping windows on the same day
    const overlaps = await prisma.availabilityWindow.findMany({
      where: {
        userId,
        dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: endTime } },
              { endTime: { gte: startTime } },
            ],
          },
        ],
      },
    });

    if (overlaps.length > 0) {
      return NextResponse.json(
        { error: 'Availability window overlaps with existing window for this day' },
        { status: 409 }
      );
    }

    const window = await prisma.availabilityWindow.create({
      data: {
        userId,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        timezone: timezone || 'UTC',
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    logger.info('Availability window created', {
      windowId: window.id,
      userId,
      dayOfWeek,
    });

    return NextResponse.json({ window }, { status: 201 });
  } catch (error) {
    logger.error('Error creating availability window:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
