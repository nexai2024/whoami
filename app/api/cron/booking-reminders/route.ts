/**
 * POST /api/cron/booking-reminders
 * Cron job endpoint to send booking reminder emails 24 hours before bookings
 * Should be called by a cron service (Vercel Cron, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { sendBookingReminder } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (if using Vercel Cron or similar)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find bookings that start in approximately 24 hours (within a 1-hour window)
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        startTime: {
          gte: new Date(in24Hours.getTime() - 30 * 60 * 1000), // 30 minutes before 24h mark
          lte: new Date(in24Hours.getTime() + 30 * 60 * 1000), // 30 minutes after 24h mark
        },
        // Only send reminders for bookings that haven't been reminded yet
        // You might want to add a 'reminderSent' field to track this
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    logger.info(`Found ${bookings.length} bookings to send reminders for`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const booking of bookings) {
      try {
        results.processed++;

        const coachName = booking.user.profile?.displayName || 
                         booking.user.profile?.username || 
                         'Coach';

        const formatDate = (date: Date) => {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        };

        const formatTime = (date: Date) => {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        };

        // Send reminder to customer
        const customerResult = await sendBookingReminder(booking.customerEmail, {
          customerName: booking.customerName || undefined,
          coachName,
          bookingDate: booking.startTime,
          bookingTime: formatTime(booking.startTime),
          duration: booking.duration,
          bookingId: booking.id,
        });

        if (customerResult.success) {
          results.sent++;
          logger.info(`Reminder sent to customer for booking ${booking.id}`);
        } else {
          results.failed++;
          results.errors.push(`Failed to send reminder to ${booking.customerEmail}: ${customerResult.error}`);
        }

        // Optionally send reminder to coach
        if (booking.user.email) {
          const coachResult = await sendBookingReminder(booking.user.email, {
            customerName: booking.customerName || booking.customerEmail,
            coachName,
            bookingDate: booking.startTime,
            bookingTime: formatTime(booking.startTime),
            duration: booking.duration,
            bookingId: booking.id,
            isCoach: true,
          });

          if (coachResult.success) {
            logger.info(`Reminder sent to coach for booking ${booking.id}`);
          }
        }

      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing booking ${booking.id}: ${(error as Error).message}`);
        logger.error(`Error sending reminder for booking ${booking.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in booking reminders cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

