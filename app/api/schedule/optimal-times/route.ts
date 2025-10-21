/**
 * GET /api/schedule/optimal-times
 * Get optimal posting times for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform } from '@prisma/client';

const prisma = new PrismaClient();

// Industry default optimal times (fallback when insufficient data)
const INDUSTRY_DEFAULTS = [
  { dayOfWeek: 2, hourOfDay: 10, platform: Platform.TWITTER, reason: 'Industry standard: Tuesday 10 AM' },
  { dayOfWeek: 2, hourOfDay: 15, platform: Platform.TWITTER, reason: 'Industry standard: Tuesday 3 PM' },
  { dayOfWeek: 3, hourOfDay: 14, platform: Platform.LINKEDIN, reason: 'Industry standard: Wednesday 2 PM' },
  { dayOfWeek: 4, hourOfDay: 17, platform: Platform.INSTAGRAM, reason: 'Industry standard: Thursday 5 PM' },
  { dayOfWeek: 1, hourOfDay: 9, platform: Platform.FACEBOOK, reason: 'Industry standard: Monday 9 AM' },
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as Platform | null;
    const count = parseInt(searchParams.get('count') || '10');
    const days = parseInt(searchParams.get('days') || '7');

    // Get user's optimal time slots
    const optimalSlots = await prisma.optimalTimeSlot.findMany({
      where: {
        userId,
        ...(platform && { platform }),
      },
      orderBy: {
        rank: 'asc',
      },
      take: count,
    });

    // Calculate data quality metrics
    const totalSampleSize = optimalSlots.reduce(
      (sum, slot) => sum + slot.sampleSize,
      0
    );
    const avgSampleSize = optimalSlots.length > 0
      ? totalSampleSize / optimalSlots.length
      : 0;

    // Determine if we have sufficient data
    const hasSufficientData = avgSampleSize >= 10;

    if (!hasSufficientData || optimalSlots.length === 0) {
      // Use industry defaults
      const defaultTimes = INDUSTRY_DEFAULTS
        .filter((def) => !platform || def.platform === platform)
        .slice(0, count)
        .map((def) => {
          const now = new Date();
          const daysUntilTarget = (def.dayOfWeek - now.getDay() + 7) % 7;
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + daysUntilTarget);
          targetDate.setHours(def.hourOfDay, 0, 0, 0);

          return {
            datetime: targetDate.toISOString(),
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][def.dayOfWeek],
            hourOfDay: def.hourOfDay,
            platform: def.platform,
            engagementRate: null,
            confidence: 50,
            rank: null,
            reason: def.reason,
          };
        });

      return NextResponse.json({
        optimalTimes: [],
        dataQuality: {
          sampleSize: totalSampleSize,
          daysAnalyzed: 0,
          confidence: 'LOW',
          message: 'Need at least 30 days of data for reliable recommendations. Using industry defaults.',
        },
        defaultTimes,
      });
    }

    // Generate optimal times for the next N days
    const now = new Date();
    const optimalTimes = [];

    for (let day = 0; day < days; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + day);
      const dayOfWeek = targetDate.getDay();

      // Find best slots for this day of week
      const daySlots = optimalSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );

      for (const slot of daySlots.slice(0, Math.ceil(count / days))) {
        const datetime = new Date(targetDate);
        datetime.setHours(slot.hourOfDay, 0, 0, 0);

        // Skip times in the past
        if (datetime <= now) continue;

        optimalTimes.push({
          datetime: datetime.toISOString(),
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek],
          hourOfDay: slot.hourOfDay,
          platform: slot.platform || 'ALL',
          engagementRate: parseFloat(slot.avgEngagementRate.toString()),
          confidence: parseFloat(slot.confidence.toString()),
          rank: slot.rank,
          reason: `Your audience shows ${slot.avgEngagementRate}% engagement at this time`,
        });

        if (optimalTimes.length >= count) break;
      }

      if (optimalTimes.length >= count) break;
    }

    // Calculate days analyzed (from oldest slot)
    const oldestSlot = optimalSlots.reduce(
      (oldest, slot) =>
        slot.analyzedFrom < oldest.analyzedFrom ? slot : oldest,
      optimalSlots[0]
    );

    const daysAnalyzed = oldestSlot
      ? Math.ceil(
          (new Date().getTime() - new Date(oldestSlot.analyzedFrom).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const confidence = avgSampleSize >= 50 ? 'HIGH' : avgSampleSize >= 20 ? 'MEDIUM' : 'LOW';

    return NextResponse.json({
      optimalTimes,
      dataQuality: {
        sampleSize: totalSampleSize,
        daysAnalyzed,
        confidence,
      },
    });
  } catch (error) {
    console.error('Error fetching optimal times:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
