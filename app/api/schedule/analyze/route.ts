/**
 * POST /api/schedule/analyze
 * Trigger analysis of optimal posting times based on user's historical data
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Trigger background analysis (in production, use a job queue like BullMQ)
    // For now, we'll do it synchronously for demonstration
    await analyzeOptimalTimes(userId);

    return NextResponse.json({
      status: 'ANALYZING',
      message: 'Analyzing your data... This may take 1-2 minutes.',
      estimatedTime: 90,
    });
  } catch (error) {
    console.error('Error triggering analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Analyze user's historical data to calculate optimal posting times
 * In production, this would be a background job
 */
async function analyzeOptimalTimes(userId: string): Promise<void> {
  try {
    // Get user's Analytics data from the past 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all page views and clicks grouped by day/hour
    const clicks = await prisma.click.findMany({
      where: {
        page: {
          userId,
        },
        timestamp: {
          gte: ninetyDaysAgo,
        },
      },
      select: {
        timestamp: true,
        blockId: true,
        pageId: true,
      },
    });

    if (clicks.length < 30) {
      // Insufficient data for reliable analysis
      console.log(`Insufficient data for user ${userId}: only ${clicks.length} clicks`);
      return;
    }

    // Group by day of week and hour
    const timeSlotStats = new Map<
      string,
      {
        dayOfWeek: number;
        hourOfDay: number;
        platform: Platform | null;
        clicks: number;
        views: number;
      }
    >();

    for (const click of clicks) {
      const date = new Date(click.timestamp);
      const dayOfWeek = date.getDay();
      const hourOfDay = date.getHours();

      // Aggregate by day/hour (not platform-specific in this simplified version)
      const key = `${dayOfWeek}-${hourOfDay}-null`;

      if (!timeSlotStats.has(key)) {
        timeSlotStats.set(key, {
          dayOfWeek,
          hourOfDay,
          platform: null,
          clicks: 0,
          views: 0,
        });
      }

      const stats = timeSlotStats.get(key)!;
      stats.clicks += 1;
      stats.views += 1; // Simplified: assume 1 view per click
    }

    // Calculate engagement rates and rank slots
    const slots = Array.from(timeSlotStats.values()).map((stats) => {
      const engagementRate = stats.views > 0
        ? (stats.clicks / stats.views) * 100
        : 0;

      return {
        ...stats,
        engagementRate,
        sampleSize: stats.views,
      };
    });

    // Sort by engagement rate
    slots.sort((a, b) => b.engagementRate - a.engagementRate);

    // Assign ranks
    slots.forEach((slot, index) => {
      (slot as any).rank = index + 1;
    });

    // Calculate confidence based on sample size
    const calculateConfidence = (sampleSize: number): number => {
      if (sampleSize >= 50) return 95;
      if (sampleSize >= 20) return 75;
      if (sampleSize >= 10) return 50;
      return 25;
    };

    // Delete existing optimal time slots for this user
    await prisma.optimalTimeSlot.deleteMany({
      where: { userId },
    });

    // Create new optimal time slot records
    await prisma.optimalTimeSlot.createMany({
      data: slots.map((slot) => ({
        userId,
        dayOfWeek: slot.dayOfWeek,
        hourOfDay: slot.hourOfDay,
        platform: slot.platform,
        avgEngagementRate: new Decimal(slot.engagementRate.toFixed(2)),
        totalViews: slot.views,
        totalClicks: slot.clicks,
        sampleSize: slot.sampleSize,
        confidence: new Decimal(calculateConfidence(slot.sampleSize).toFixed(2)),
        rank: (slot as any).rank,
        analyzedFrom: ninetyDaysAgo,
        analyzedTo: new Date(),
      })),
    });

    console.log(`Successfully analyzed optimal times for user ${userId}: ${slots.length} time slots`);
  } catch (error) {
    console.error('Error in analyzeOptimalTimes:', error);
    throw error;
  }
}
