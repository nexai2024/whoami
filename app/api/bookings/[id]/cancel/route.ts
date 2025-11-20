/**
 * POST /api/bookings/[id]/cancel - Cancel a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { sendBookingCancellation } from '@/lib/services/emailService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization - only coach or customer can cancel
    const isCoach = booking.userId === userId;
    const isCustomer = booking.customerEmail && userId && 
      (await prisma.user.findUnique({ where: { id: userId } }))?.email === booking.customerEmail;

    if (!isCoach && !isCustomer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 400 }
      );
    }

    // Check if booking is too close to start time (e.g., within 24 hours)
    const bookingStart = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24 && !isCoach) {
      return NextResponse.json(
        { error: 'Bookings cannot be cancelled within 24 hours of the scheduled time' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason 
          ? `${booking.notes || ''}\n\n[Cancelled: ${reason}]`.trim()
          : booking.notes
      }
    });

    // Send cancellation emails
    try {
      // Email to customer
      await sendBookingCancellation(booking.customerEmail, {
        customerName: booking.customerName || undefined,
        coachName: booking.user.profile?.displayName || booking.user.profile?.username || 'Coach',
        startTime: booking.startTime,
        duration: booking.duration,
        reason: reason || undefined,
        cancelledBy: isCoach ? 'coach' : 'customer'
      });

      // Email to coach
      if (booking.user.email) {
        await sendBookingCancellation(booking.user.email, {
          customerName: booking.customerName || booking.customerEmail,
          coachName: booking.user.profile?.displayName || booking.user.profile?.username || 'Coach',
          startTime: booking.startTime,
          duration: booking.duration,
          reason: reason || undefined,
          cancelledBy: isCoach ? 'coach' : 'customer'
        });
      }
    } catch (emailError) {
      logger.error('Error sending cancellation emails:', emailError);
      // Don't fail the cancellation if email fails
    }

    logger.info('Booking cancelled:', { bookingId: id, userId, reason });

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

