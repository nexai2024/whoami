/**
 * POST /api/schedule/bulk
 * Schedule multiple posts with smart timing
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform, PostType, ScheduleStatus } from '@prisma/client';

const prisma = new PrismaClient();

type SpreadMode = 'OPTIMAL' | 'EVENLY' | 'MANUAL';

interface BulkPost {
  content: string;
  mediaUrls?: string[];
  platform: Platform;
  postType: PostType;
  scheduledFor?: string; // Only for MANUAL mode
}

interface BulkConfig {
  spread: SpreadMode;
  startDate: string;
  endDate?: string;
  autoPost?: boolean;
  timezone?: string;
}

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

    const body = await request.json();
    const { posts, config } = body as {
      posts: BulkPost[];
      config: BulkConfig;
    };

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts provided' },
        { status: 400 }
      );
    }

    const {
      spread = 'OPTIMAL',
      startDate,
      endDate,
      autoPost = false,
      timezone = 'UTC',
    } = config;

    // Get user's scheduling preferences
    const prefs = await prisma.schedulingPreferences.findUnique({
      where: { userId },
    });

    const minHoursBetween = prefs?.minHoursBetween || 4;

    // Calculate schedule times based on spread mode
    let scheduleTimes: Date[] = [];

    if (spread === 'MANUAL') {
      // Use provided times
      scheduleTimes = posts.map((post) => new Date(post.scheduledFor!));
    } else if (spread === 'EVENLY') {
      // Distribute evenly across date range
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(start);
      end.setDate(start.getDate() + 7); // Default 7 days

      const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      const intervalMinutes = totalMinutes / posts.length;

      scheduleTimes = posts.map((_, index) => {
        const time = new Date(start);
        time.setMinutes(time.getMinutes() + intervalMinutes * index);
        return time;
      });
    } else if (spread === 'OPTIMAL') {
      // Use optimal time slots
      const optimalSlots = await prisma.optimalTimeSlot.findMany({
        where: { userId },
        orderBy: { rank: 'asc' },
        take: 50,
      });

      if (optimalSlots.length === 0) {
        // Fall back to evenly spread if no optimal times available
        const start = new Date(startDate);
        const daysToSpread = Math.min(posts.length, 7);

        scheduleTimes = posts.map((_, index) => {
          const time = new Date(start);
          const dayOffset = Math.floor(index / 3); // 3 posts per day max
          const hourOffset = (index % 3) * 4; // 4 hours apart

          time.setDate(start.getDate() + dayOffset);
          time.setHours(9 + hourOffset, 0, 0, 0);

          return time;
        });
      } else {
        // Assign posts to optimal slots
        const start = new Date(startDate);
        const usedSlots = new Set<string>();

        scheduleTimes = posts.map((post) => {
          // Find best unused slot for this platform
          const platformSlots = optimalSlots.filter(
            (slot) =>
              !slot.platform || slot.platform === post.platform
          );

          for (const slot of platformSlots) {
            const slotKey = `${slot.dayOfWeek}-${slot.hourOfDay}`;

            if (!usedSlots.has(slotKey)) {
              usedSlots.add(slotKey);

              // Calculate next occurrence of this day/hour
              const now = new Date(start);
              const daysUntil = (slot.dayOfWeek - now.getDay() + 7) % 7;
              const scheduleTime = new Date(now);
              scheduleTime.setDate(now.getDate() + daysUntil);
              scheduleTime.setHours(slot.hourOfDay, 0, 0, 0);

              // Ensure it's not in the past
              if (scheduleTime < now) {
                scheduleTime.setDate(scheduleTime.getDate() + 7);
              }

              return scheduleTime;
            }
          }

          // Fallback if all slots used
          const fallback = new Date(start);
          fallback.setHours(fallback.getHours() + usedSlots.size * minHoursBetween);
          return fallback;
        });
      }
    }

    // Ensure minimum spacing between posts
    scheduleTimes.sort((a, b) => a.getTime() - b.getTime());

    for (let i = 1; i < scheduleTimes.length; i++) {
      const prevTime = scheduleTimes[i - 1];
      const currentTime = scheduleTimes[i];
      const hoursDiff =
        (currentTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < minHoursBetween) {
        // Adjust time to maintain minimum spacing
        scheduleTimes[i] = new Date(
          prevTime.getTime() + minHoursBetween * 60 * 60 * 1000
        );
      }
    }

    // Create scheduled posts
    const scheduledPosts = await Promise.all(
      posts.map(async (post, index) => {
        return prisma.scheduledPost.create({
          data: {
            userId,
            content: post.content,
            mediaUrls: post.mediaUrls || [],
            platform: post.platform,
            platformType: post.postType,
            scheduledFor: scheduleTimes[index],
            timezone,
            autoPost,
            status: ScheduleStatus.PENDING,
          },
        });
      })
    );

    return NextResponse.json({
      scheduledPosts: scheduledPosts.map((post) => ({
        id: post.id,
        content: post.content,
        platform: post.platform,
        scheduledFor: post.scheduledFor.toISOString(),
        status: post.status,
      })),
      summary: {
        total: scheduledPosts.length,
        startDate: scheduleTimes[0].toISOString(),
        endDate: scheduleTimes[scheduleTimes.length - 1].toISOString(),
        spread,
      },
    });
  } catch (error) {
    console.error('Error bulk scheduling posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
