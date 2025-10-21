/**
 * Process Scheduled Posts Job
 * Checks for posts that need to be published and publishes them
 * Should run every 5 minutes via cron job
 */

import { PrismaClient, ScheduleStatus, Platform } from '@prisma/client';
import platformPublisher, { PlatformCredentials } from '../services/platformPublisher';
import emailService from '../services/emailService';

const prisma = new PrismaClient();

interface ProcessResult {
  processed: number;
  published: number;
  failed: number;
  errors: Array<{ postId: string; error: string }>;
}

/**
 * Main job function
 */
export async function processScheduledPosts(): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    published: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Find all posts that should be published now
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const postsToPublish = await prisma.scheduledPost.findMany({
      where: {
        status: ScheduleStatus.PENDING,
        autoPost: true,
        scheduledFor: {
          lte: now,
          gte: fiveMinutesAgo, // Safety: only process posts from last 5 minutes
        },
      },
      take: 50, // Process max 50 posts per run
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    console.log(`Found ${postsToPublish.length} posts to publish`);

    // Process each post
    for (const post of postsToPublish) {
      result.processed++;

      try {
        // Mark as processing
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: ScheduleStatus.PROCESSING,
            attempts: post.attempts + 1,
          },
        });

        // Get user's platform credentials
        const credentials = await getPlatformCredentials(
          post.userId,
          post.platform
        );

        if (!credentials) {
          throw new Error(`No credentials found for platform ${post.platform}`);
        }

        // Publish the post
        const publishResult = await platformPublisher.publish(
          post.platform,
          {
            content: post.content,
            mediaUrls: post.mediaUrls,
          },
          post.platformType,
          credentials
        );

        if (publishResult.success) {
          // Update post as published
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: {
              status: ScheduleStatus.PUBLISHED,
              publishedAt: new Date(),
              externalId: publishResult.externalId,
              externalUrl: publishResult.externalUrl,
            },
          });

          result.published++;
          console.log(`✓ Published post ${post.id} to ${post.platform}`);
        } else {
          throw new Error(publishResult.error || 'Unknown publishing error');
        }
      } catch (error) {
        result.failed++;
        const errorMessage = (error as Error).message;

        console.error(`✗ Failed to publish post ${post.id}:`, errorMessage);

        // Update post as failed
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: ScheduleStatus.FAILED,
            lastError: errorMessage,
          },
        });

        result.errors.push({
          postId: post.id,
          error: errorMessage,
        });

        // Send failure notification to user
        try {
          const user = await prisma.user.findUnique({
            where: { id: post.userId },
          });

          if (user) {
            await emailService.sendPostFailureNotification(user.email, {
              platform: post.platform,
              content: post.content,
              errorMessage,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/schedule`,
            });
          }
        } catch (notificationError) {
          console.error('Failed to send failure notification:', notificationError);
        }
      }

      // Small delay between posts to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `Job complete: ${result.published} published, ${result.failed} failed`
    );

    return result;
  } catch (error) {
    console.error('Error in processScheduledPosts job:', error);
    throw error;
  }
}

/**
 * Get platform credentials for a user
 */
async function getPlatformCredentials(
  userId: string,
  platform: Platform
): Promise<PlatformCredentials | null> {
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        type: platform as any, // IntegrationType matches Platform for social platforms
        isActive: true,
      },
    });

    if (!integration) {
      return null;
    }

    // Extract credentials from encrypted config
    const config = integration.config as any;

    return {
      accessToken: config.accessToken || '',
      refreshToken: config.refreshToken,
      expiresAt: config.expiresAt ? new Date(config.expiresAt) : undefined,
      additionalData: config.additionalData || {},
    };
  } catch (error) {
    console.error('Error getting platform credentials:', error);
    return null;
  }
}

/**
 * Retry failed posts (manual retry)
 */
export async function retryFailedPost(postId: string): Promise<boolean> {
  try {
    const post = await prisma.scheduledPost.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== ScheduleStatus.FAILED) {
      return false;
    }

    // Reset to pending for next job run
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: ScheduleStatus.PENDING,
        lastError: null,
      },
    });

    return true;
  } catch (error) {
    console.error('Error retrying failed post:', error);
    return false;
  }
}

/**
 * Cancel a scheduled post
 */
export async function cancelScheduledPost(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const post = await prisma.scheduledPost.findFirst({
      where: {
        id: postId,
        userId,
        status: ScheduleStatus.PENDING,
      },
    });

    if (!post) {
      return false;
    }

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: ScheduleStatus.CANCELLED,
      },
    });

    return true;
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    return false;
  }
}

export default {
  processScheduledPosts,
  retryFailedPost,
  cancelScheduledPost,
};
