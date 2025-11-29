// lib/rate-limit.ts
import prisma from './prisma'
import { getLimitForFeature, getPlanKeyFromStrings, type PlanKey } from './billing/planConfig'
import { logger } from './utils/logger'

export type RateLimitResult = {
  allowed: boolean
  limit?: number
  remaining?: number
  resetAt?: Date
  message?: string
}

export class RateLimitService {
  /**
   * Check if user can access a feature based on their subscription
   */
  static async checkFeatureAccess(
    userId: string,
    featureName: string
  ): Promise<RateLimitResult> {
    // Try DB-backed subscription/plan features first
    const dbResult = await this.checkDbPlanFeature(userId, featureName)
    if (dbResult) {
      logger.info("DB-backed subscription/plan features result:", dbResult);
      return dbResult
    }

    // Fallback to config-based limits using Profile.plan or default to FREE
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { plan: true },
    })
    const planKey: PlanKey = getPlanKeyFromStrings(profile?.plan)
    logger.info("Plan key:", planKey);
    const limit = getLimitForFeature(planKey, featureName)
    logger.info("Limit:", limit);
    if (limit === 'unlimited') {
      return { allowed: true }
    }

    // Ensure a Feature exists to track usage; upsert by name
    const feature = await prisma.feature.upsert({
      where: { name: featureName },
      update: {},
      create: {
        name: featureName,
        type: 'quota',
        description: `${featureName} usage`,
      },
    })
    logger.info("Feature:", feature);
    // For Free/Basic/Pro fallback, use calendar month window
    const { periodStart, periodEnd } = this.getCalendarMonthBounds(new Date())

    const result = await this.checkQuota(userId, feature.id, Number(limit || 0), periodStart, periodEnd)
    logger.info("Result:", result);
    return result;
  }

  private static async checkDbPlanFeature(userId: string, featureName: string): Promise<RateLimitResult | undefined> {
    // Fetch subscription and plan for the user
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          include: {
            features: {
              where: { feature: { name: featureName } },
              include: { feature: true },
            },
          },
        },
      },
    });

    // Ensure the subscription and plan features exist
    if (!subscription?.plan?.features?.length) {
      return {
        allowed: false,
        message: 'Feature not available in your plan',
      }
    }
    // Get the planFeature object (first feature entry)
    const planFeature = subscription.plan.features[0];

    if (!planFeature.enabled) {
      return {
        allowed: false,
        message: 'Feature is disabled',
      }
    }

    if (planFeature.feature.type === 'boolean') {
      return { allowed: true }
    }
    if (planFeature.rateLimit && planFeature.ratePeriod) {
      return await this.checkRateLimit(
        userId,
        planFeature.featureId,
        planFeature.rateLimit,
        planFeature.ratePeriod
      )
    }
    if (planFeature.limit !== null) {
      return await this.checkQuota(
        userId,
        planFeature.featureId,
        planFeature.limit,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd
      )
    }
    return { allowed: true }
  }
  /**
   * Check rate limit (per minute/hour/day)
   */
  private static async checkRateLimit(
  userId: string,
  featureId: string,
  rateLimit: number,
  ratePeriod: string
): Promise < RateLimitResult > {
  const now = new Date()
    const { periodStart, periodEnd } = this.getPeriodBounds(now, ratePeriod)

    // Get or create usage record
    const usage = await prisma.usageRecord.upsert({
    where: {
      userId_featureId_periodStart: {
        userId,
        featureId,
        periodStart,
      },
    },
    update: {},
    create: {
      userId,
      featureId,
      count: 0,
      periodStart,
      periodEnd,
    },
  })

    const remaining = rateLimit - usage.count
    logger.info("Remaining:", remaining);
    if(remaining <= 0) {
      logger.info("Rate limit exceeded", remaining);
  return {
    allowed: false,
    limit: rateLimit,
    remaining: 0,
    resetAt: periodEnd,
    message: `Rate limit exceeded. Resets at ${periodEnd.toISOString()}`,
  }
}

return {
  allowed: true,
  limit: rateLimit,
  remaining,
  resetAt: periodEnd,
}
  }

  /**
   * Check quota limit (per billing period)
   */
  private static async checkQuota(
  userId: string,
  featureId: string,
  limit: number,
  periodStart: Date,
  periodEnd: Date
): Promise < RateLimitResult > {
  const usage = await prisma.usageRecord.findUnique({
    where: {
      userId_featureId_periodStart: {
        userId,
        featureId,
        periodStart,
      },
    },
  })

    const currentCount = usage?.count || 0
    const remaining = limit - currentCount

    if(remaining <= 0) {
  return {
    allowed: false,
    limit,
    remaining: 0,
    resetAt: periodEnd,
    message: `Quota exceeded. Resets at ${periodEnd.toISOString()}`,
  }
}

return {
  allowed: true,
  limit,
  remaining,
  resetAt: periodEnd,
}
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(
  userId: string,
  featureName: string
): Promise < void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: {
        include: {
          features: {
            include: {
              feature: true,
            },
            where: {
              feature: {
                name: featureName,
              },
            },
          },
        },
      },
    },
  })

    if(!subscription) return

    const planFeature = subscription.plan.features[0]
    if(!planFeature) return

    // Determine period based on rate limit or quota
    let periodStart: Date
    let periodEnd: Date

    if(planFeature.ratePeriod) {
  const now = new Date()
  const bounds = this.getPeriodBounds(now, planFeature.ratePeriod)
  periodStart = bounds.periodStart
  periodEnd = bounds.periodEnd
} else {
  periodStart = subscription.currentPeriodStart
  periodEnd = subscription.currentPeriodEnd
}

await prisma.usageRecord.upsert({
  where: {
    userId_featureId_periodStart: {
      userId,
      featureId: planFeature.featureId,
      periodStart,
    },
  },
  update: {
    count: {
      increment: 1,
    },
  },
  create: {
    userId,
    featureId: planFeature.featureId,
    count: 1,
    periodStart,
    periodEnd,
  },
})
  }

  /**
   * Get period boundaries based on rate period type
   */
  private static getPeriodBounds(
  now: Date,
  ratePeriod: string
): { periodStart: Date; periodEnd: Date } {
  const periodStart = new Date(now)
  const periodEnd = new Date(now)

  switch (ratePeriod) {
    case 'minute':
      periodStart.setSeconds(0, 0)
      periodEnd.setSeconds(59, 999)
      break
    case 'hour':
      periodStart.setMinutes(0, 0, 0)
      periodEnd.setMinutes(59, 59, 999)
      break
    case 'day':
      periodStart.setHours(0, 0, 0, 0)
      periodEnd.setHours(23, 59, 59, 999)
      break
    default:
      throw new Error(`Invalid rate period: ${ratePeriod}`)
  }

  return { periodStart, periodEnd }
}

  private static getCalendarMonthBounds(now: Date): { periodStart: Date; periodEnd: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { periodStart: start, periodEnd: end }
}

  /**
   * Clean up expired usage records
   */
  static async cleanupExpiredRecords(): Promise < number > {
  const result = await prisma.usageRecord.deleteMany({
    where: {
      periodEnd: {
        lt: new Date(),
      },
    },
  })

    return result.count
}
}