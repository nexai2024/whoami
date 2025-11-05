import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/availability/slots?userId=xxx&date=YYYY-MM-DD&duration=60
 * Get available booking slots for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dateParam = searchParams.get('date');
    const durationParam = searchParams.get('duration');

    if (!userId || !dateParam || !durationParam) {
      return NextResponse.json(
        { error: 'userId, date, and duration are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const duration = parseInt(durationParam);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      );
    }

    const dayOfWeek = targetDate.getDay();

    // Get active availability windows for this day of week
    const windows = await prisma.availabilityWindow.findMany({
      where: {
        userId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (windows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Check for blackout dates
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const blackouts = await prisma.blackoutDate.findMany({
      where: {
        userId,
        OR: [
          {
            AND: [
              { startDate: { lte: endOfDay } },
              { endDate: { gte: startOfDay } },
            ],
          },
        ],
      },
    });

    if (blackouts.length > 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Generate slots from windows
    const slots: { start: string; end: string }[] = [];
    const slotInterval = 30; // 30-minute intervals
    const now = new Date();

    for (const window of windows) {
      const [winStartH, winStartM] = window.startTime.split(':').map(Number);
      const [winEndH, winEndM] = window.endTime.split(':').map(Number);

      const windowStart = new Date(targetDate);
      windowStart.setHours(winStartH, winStartM, 0, 0);

      const windowEnd = new Date(targetDate);
      windowEnd.setHours(winEndH, winEndM, 0, 0);

      // Generate slots within this window
      let currentSlot = new Date(windowStart);

      while (currentSlot.getTime() + duration * 60 * 1000 <= windowEnd.getTime()) {
        const slotEnd = new Date(currentSlot);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        // Skip slots in the past
        if (currentSlot < now) {
          currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
          continue;
        }

        // Check for conflicts with existing bookings
        const hasConflict = bookings.some((booking: any) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);

          // Check if slots overlap
          return (
            (currentSlot < bookingEnd && slotEnd > bookingStart)
          );
        });

        if (!hasConflict) {
          slots.push({
            start: currentSlot.toISOString(),
            end: slotEnd.toISOString(),
          });
        }

        currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
      }
    }

    // Sort slots by start time
    slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json({ slots });
  } catch (error) {
    logger.error('Error generating availability slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
