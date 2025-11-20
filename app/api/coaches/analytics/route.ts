/**
 * GET /api/coaches/analytics
 * Get coach-specific analytics including bookings, sales, and course enrollments
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const range = searchParams.get('range') || '30d';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        id: true,
        price: true,
        currency: true,
        startTime: true,
        status: true,
        createdAt: true
      }
    });

    // Get product sales
    const sales = await prisma.sale.findMany({
      where: {
        product: {
          userId
        },
        createdAt: { gte: startDate },
        status: 'completed'
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });

    // Get course enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        course: {
          userId
        },
        createdAt: { gte: startDate }
      },
      include: {
        course: {
          select: {
            title: true,
            price: true
          }
        }
      }
    });

    // Get creator earnings
    const earnings = await prisma.creatorEarning.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: { in: ['available', 'paid'] }
      }
    });

    // Calculate metrics
    const totalRevenue = earnings.reduce((sum: number, e: any) => sum + Number(e.netAmount), 0) +
                        bookings.reduce((sum: number, b: any) => sum + (b.price ? Number(b.price) : 0), 0) +
                        enrollments.filter((e: any) => e.paymentStatus === 'completed')
                          .reduce((sum: number, e: any) => sum + (e.paymentAmount ? Number(e.paymentAmount) : 0), 0);

    const totalBookings = bookings.length;
    const totalProducts = sales.length;
    const totalEnrollments = enrollments.length;
    const totalCourses = await prisma.course.count({
      where: { userId }
    });

    const averageBookingValue = totalBookings > 0
      ? bookings.reduce((sum: number, b: any) => sum + (b.price ? Number(b.price) : 0), 0) / totalBookings
      : 0;

    // Calculate conversion rate (simplified - views to bookings/sales)
    // This would need view tracking to be accurate
    const conversionRate = 0; // Placeholder

    // Recent activity
    const recentActivity = [
      ...bookings.slice(0, 5).map((b: any) => ({
        type: 'booking',
        description: `New booking for $${b.price || 0}`,
        timestamp: b.createdAt
      })),
      ...sales.slice(0, 5).map((s: any) => ({
        type: 'sale',
        description: `Sale: ${s.product.name} - $${s.amount}`,
        timestamp: s.createdAt
      })),
      ...enrollments.slice(0, 5).map((e: any) => ({
        type: 'enrollment',
        description: `New enrollment: ${e.course.title}`,
        timestamp: e.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalRevenue,
      totalBookings,
      totalProducts,
      totalCourses,
      totalEnrollments,
      averageBookingValue,
      conversionRate,
      bookings: bookings.slice(0, 10),
      sales: sales.slice(0, 10),
      enrollments: enrollments.slice(0, 10),
      recentActivity,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching coach analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

