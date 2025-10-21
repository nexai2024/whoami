/**
 * POST /api/schedule/posts
 * Schedule a new post
 *
 * GET /api/schedule/posts
 * Get all scheduled posts for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Platform, PostType, ScheduleStatus } from '@prisma/client';

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

    const body = await request.json();
    const {
      content,
      mediaUrls = [],
      platform,
      postType,
      scheduledFor,
      autoPost = false,
      timezone = 'UTC',
      campaignAssetId,
      repurposedAssetId,
    } = body;

    // Validate required fields
    if (!content || !platform || !postType || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: content, platform, postType, scheduledFor' },
        { status: 400 }
      );
    }

    // Check if platform is connected (check Integration table)
    if (autoPost) {
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          type: platform,
          isActive: true,
        },
      });

      if (!integration) {
        return NextResponse.json(
          {
            error: `Platform not connected. Please connect your ${platform} account before scheduling auto-posts.`,
            code: 'PLATFORM_NOT_CONNECTED',
          },
          { status: 400 }
        );
      }
    }

    // TODO: Check subscription plan limits
    // For now, just check a simple daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPostCount = await prisma.scheduledPost.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get user's scheduling preferences
    const prefs = await prisma.schedulingPreferences.findUnique({
      where: { userId },
    });

    const maxPostsPerDay = prefs?.maxPostsPerDay || 5;

    if (todayPostCount >= maxPostsPerDay) {
      return NextResponse.json(
        {
          error: `Daily post limit reached (${maxPostsPerDay}). Upgrade your plan for more scheduled posts.`,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Create scheduled post
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId,
        content,
        mediaUrls,
        platform,
        platformType: postType,
        scheduledFor: new Date(scheduledFor),
        timezone,
        autoPost,
        status: ScheduleStatus.PENDING,
        campaignAssetId: campaignAssetId || null,
        repurposedAssetId: repurposedAssetId || null,
      },
    });

    return NextResponse.json({
      scheduledPostId: scheduledPost.id,
      scheduledFor: scheduledPost.scheduledFor.toISOString(),
      status: scheduledPost.status,
      message: 'Post scheduled successfully',
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get('status') as ScheduleStatus | null;
    const platform = searchParams.get('platform') as Platform | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(platform && { platform }),
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.scheduledPost.count({
      where: {
        userId,
        ...(status && { status }),
        ...(platform && { platform }),
      },
    });

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        platform: post.platform,
        postType: post.platformType,
        scheduledFor: post.scheduledFor.toISOString(),
        status: post.status,
        autoPost: post.autoPost,
        publishedAt: post.publishedAt?.toISOString() || null,
        externalUrl: post.externalUrl,
        performance: {
          views: post.views,
          clicks: post.clicks,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
