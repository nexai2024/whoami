import prisma from '@/lib/prisma';
import { logger } from './logger';

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number | null; // null = unlimited
  current: number;
  limit: number | null;
}

/**
 * Record usage of a feature for a user
 */
export async function recordUsage(
  userId: string,
  featureName: string,
  count: number = 1
): Promise<void> {
  try {
    // Get or create feature
    let feature = await prisma.feature.findUnique({
      where: { name: featureName },
    });

    if (!feature) {
      feature = await prisma.feature.create({
        data: {
          name: featureName,
          type: 'quota', // Default type
        },
      });
    }

    // Get user's subscription to determine billing period
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });

    let periodStart: Date;
    let periodEnd: Date;

    if (subscription) {
      periodStart = subscription.currentPeriodStart;
      periodEnd = subscription.currentPeriodEnd;
    } else {
      // FREE plan: use calendar month
      const now = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Find or create usage record for this period
    const existingRecord = await prisma.usageRecord.findUnique({
      where: {
        userId_featureId_periodStart: {
          userId,
          featureId: feature.id,
          periodStart,
        },
      },
    });

    if (existingRecord) {
      // Update existing record
      await prisma.usageRecord.update({
        where: { id: existingRecord.id },
        data: {
          count: {
            increment: count,
          },
        },
      });
    } else {
      // Create new record
      await prisma.usageRecord.create({
        data: {
          userId,
          featureId: feature.id,
          count,
          periodStart,
          periodEnd,
        },
      });
    }

    logger.info('Usage recorded', {
      userId,
      featureName,
      count,
      periodStart,
    });
  } catch (error) {
    logger.error('Error recording usage:', error);
    // Don't throw - usage tracking shouldn't break the main flow
  }
}

/**
 * Check if user can use a feature (quota check)
 */
export async function checkUsage(
  userId: string,
  featureName: string
): Promise<UsageCheckResult> {
  try {
    // Get feature
    const feature = await prisma.feature.findUnique({
      where: { name: featureName },
    });

    if (!feature) {
      // Feature doesn't exist, allow by default
      return {
        allowed: true,
        remaining: null,
        current: 0,
        limit: null,
      };
    }

    // Get user's subscription and plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          include: {
            features: {
              where: {
                featureId: feature.id,
              },
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    // Get plan feature limit
    let limit: number | null = null;
    let enabled = true;

    if (subscription) {
      const planFeature = subscription.plan.features[0];
      if (planFeature) {
        limit = planFeature.limit;
        enabled = planFeature.enabled;
      }
    } else {
      // Check FREE plan
      const freePlan = await prisma.plan.findFirst({
        where: { planEnum: 'FREE' },
        include: {
          features: {
            where: {
              featureId: feature.id,
            },
          },
        },
      });
      if (freePlan?.features[0]) {
        limit = freePlan.features[0].limit;
        enabled = freePlan.features[0].enabled;
      }
    }

    if (!enabled) {
      return {
        allowed: false,
        remaining: 0,
        current: 0,
        limit,
      };
    }

    // Get current period usage
    let periodStart: Date;
    let periodEnd: Date;

    if (subscription) {
      periodStart = subscription.currentPeriodStart;
      periodEnd = subscription.currentPeriodEnd;
    } else {
      const now = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const usageRecord = await prisma.usageRecord.findUnique({
      where: {
        userId_featureId_periodStart: {
          userId,
          featureId: feature.id,
          periodStart,
        },
      },
    });

    const current = usageRecord?.count || 0;

    // If unlimited (limit === null), always allow
    if (limit === null) {
      return {
        allowed: true,
        remaining: null,
        current,
        limit: null,
      };
    }

    const remaining = Math.max(0, limit - current);
    const allowed = current < limit;

    return {
      allowed,
      remaining,
      current,
      limit,
    };
  } catch (error) {
    logger.error('Error checking usage:', error);
    // On error, allow by default (fail open)
    return {
      allowed: true,
      remaining: null,
      current: 0,
      limit: null,
    };
  }
}

/**
 * Record usage and check quota in one call
 */
export async function recordAndCheckUsage(
  userId: string,
  featureName: string,
  count: number = 1
): Promise<UsageCheckResult> {
  // First check if allowed
  const check = await checkUsage(userId, featureName);
  
  if (!check.allowed) {
    return check;
  }

  // Record usage
  await recordUsage(userId, featureName, count);

  // Re-check after recording
  return checkUsage(userId, featureName);
}
