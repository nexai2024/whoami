import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/services/emailService';

/**
 * GET /api/bookings?userId=xxx
 * List bookings for a user (coach)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get('userId');
    const status = searchParams.get('status');
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

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const {
      coachUserId, // Coach's userId
      customerEmail,
      customerName,
      startTime,
      duration,
      price,
      currency,
      notes,
    } = body;

    // For public bookings (from coach profile), coachUserId is provided
    // For authenticated bookings, use userId from header
    const bookingUserId = coachUserId || userId;

    if (!bookingUserId) {
      return NextResponse.json(
        { error: 'Coach userId is required' },
        { status: 400 }
      );
    }

    if (!customerEmail || !startTime || !duration) {
      return NextResponse.json(
        { error: 'customerEmail, startTime, and duration are required' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startTime format' },
        { status: 400 }
      );
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    // Validate booking is not in the past
    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book in the past' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        userId: bookingUserId,
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Check against availability windows
    const dayOfWeek = start.getDay();
    const startTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    const windows = await prisma.availabilityWindow.findMany({
      where: {
        userId: bookingUserId,
        dayOfWeek,
        isActive: true,
      },
    });

    const isWithinWindow = windows.some((window: any) => {
      const [winStartH, winStartM] = window.startTime.split(':').map(Number);
      const [winEndH, winEndM] = window.endTime.split(':').map(Number);
      const [slotStartH, slotStartM] = startTimeStr.split(':').map(Number);
      const [slotEndH, slotEndM] = endTimeStr.split(':').map(Number);

      const winStart = winStartH * 60 + winStartM;
      const winEnd = winEndH * 60 + winEndM;
      const slotStart = slotStartH * 60 + slotStartM;
      const slotEnd = slotEndH * 60 + slotEndM;

      return slotStart >= winStart && slotEnd <= winEnd;
    });

    if (!isWithinWindow && windows.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is outside availability windows' },
        { status: 400 }
      );
    }

    // Check against blackout dates
    const blackouts = await prisma.blackoutDate.findMany({
      where: {
        userId: bookingUserId,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (blackouts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot falls within a blackout period' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: bookingUserId,
        customerEmail,
        customerName: customerName || null,
        startTime: start,
        endTime: end,
        duration,
        price: price ? parseFloat(price.toString()) : null,
        currency: currency || 'USD',
        status: 'PENDING',
        notes: notes || null,
      },
    });

    logger.info('Booking created', { bookingId: booking.id, coachUserId: bookingUserId });

    // Send confirmation emails
    try {
      // Get coach details
      const coachProfile = await prisma.profile.findUnique({
        where: { userId: bookingUserId },
        include: {
          user: {
            select: { email: true },
          },
        },
      });

      const coachEmail = coachProfile?.user?.email || null;
      const coachName = coachProfile?.displayName || coachProfile?.username || 'Coach';

      // Format booking time
      const bookingTime = start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Send confirmation to customer
      await sendBookingConfirmation(customerEmail, {
        customerName: customerName || undefined,
        coachName,
        bookingDate: start,
        bookingTime,
        duration,
        bookingId: booking.id,
        coachEmail: coachEmail || undefined,
        notes: notes || undefined,
      });

      // Send notification to coach
      if (coachEmail) {
        await sendBookingNotification(coachEmail, {
          coachName,
          customerName: customerName || customerEmail,
          customerEmail,
          bookingDate: start,
          bookingTime,
          duration,
          bookingId: booking.id,
          notes: notes || undefined,
        });
      }

      logger.info('Booking confirmation emails sent', { bookingId: booking.id });
    } catch (emailError) {
      // Log error but don't fail the booking creation
      logger.error('Error sending booking emails:', emailError);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    logger.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
