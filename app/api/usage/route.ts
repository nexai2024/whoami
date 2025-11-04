// app/api/usage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

// GET /api/usage?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const authenticatedUserId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user can only access their own usage
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get user's subscription and current billing period
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    })

    // If no subscription, user is on FREE plan
    let currentPeriodStart = new Date()
    let currentPeriodEnd = new Date()
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // Default to next month

    if (subscription) {
      currentPeriodStart = subscription.currentPeriodStart
      currentPeriodEnd = subscription.currentPeriodEnd
    }

    // Get FREE plan features if no subscription
    let planFeatures = subscription?.plan.features || []
    if (!subscription) {
      const freePlan = await prisma.plan.findFirst({
        where: { planEnum: 'FREE' },
        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
      })
      planFeatures = freePlan?.features || []
    }

    // Get usage records for current billing period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        periodStart: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd,
        },
      },
      include: {
        feature: true,
      },
    })

    // Aggregate usage by feature
    const usageByFeature = new Map<string, { used: number; feature: any }>()
    
    for (const record of usageRecords) {
      const featureId = record.featureId
      const existing = usageByFeature.get(featureId)
      if (existing) {
        existing.used += record.count
      } else {
        usageByFeature.set(featureId, {
          used: record.count,
          feature: record.feature,
        })
      }
    }

    // Build usage array with limits from plan
    const usage = planFeatures.map((planFeature: any) => {
      const featureUsage = usageByFeature.get(planFeature.featureId) || { used: 0, feature: planFeature.feature }
      
      return {
        featureName: planFeature.feature.name,
        displayName: planFeature.feature.name
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        used: featureUsage.used,
        limit: planFeature.limit, // null = unlimited
        resetDate: currentPeriodEnd.toISOString(),
        feature: planFeature.feature,
        planFeature: {
          enabled: planFeature.enabled,
          rateLimit: planFeature.rateLimit,
          ratePeriod: planFeature.ratePeriod,
        },
      }
    })

    // Also include any features with usage that might not be in current plan
    // (for downgrades, to show what was used)
    for (const [featureId, featureUsage] of usageByFeature.entries()) {
      const alreadyIncluded = usage.some((u: any) => u.feature.id === featureId)
      if (!alreadyIncluded) {
        usage.push({
          featureName: featureUsage.feature.name,
          displayName: featureUsage.feature.name
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          used: featureUsage.used,
          limit: null, // No limit if not in current plan
          resetDate: currentPeriodEnd.toISOString(),
          feature: featureUsage.feature,
          planFeature: null,
        })
      }
    }

    return NextResponse.json({ usage, periodStart: currentPeriodStart, periodEnd: currentPeriodEnd })
  } catch (error) {
    logger.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}