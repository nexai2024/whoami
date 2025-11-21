/**
 * Server-side content gating utility
 * Reusable functions for checking feature access and rate limits in API routes
 */

import { NextResponse } from 'next/server';
import { RateLimitService, RateLimitResult } from '@/lib/rate-limit';
import { recordUsage } from '@/lib/utils/usageTracker';

export interface GateResult {
  allowed: boolean;
  response?: NextResponse;
  limit?: number;
  remaining?: number;
  message?: string;
}

/**
 * Check if user can access a feature and return appropriate response
 * @param userId - User ID
 * @param featureName - Feature name to check
 * @param incrementUsage - Whether to increment usage if allowed
 * @returns GateResult with allowed status and optional error response
 */
export async function checkFeatureGate(
  userId: string,
  featureName: string,
  incrementUsage: boolean = false
): Promise<GateResult> {
  try {
    const result: RateLimitResult = await RateLimitService.checkFeatureAccess(
      userId,
      featureName
    );

    if (!result.allowed) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: result.message || 'Feature not available in your plan',
            limit: result.limit,
            remaining: result.remaining,
            resetAt: result.resetAt,
          },
          { status: 403 }
        ),
        limit: result.limit,
        remaining: result.remaining,
        message: result.message,
      };
    }

    // Increment usage if allowed and requested
    if (incrementUsage) {
      try {
        await recordUsage(userId, featureName, 1);
      } catch (error) {
        console.error('Error recording usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    return {
      allowed: true,
      limit: result.limit,
      remaining: result.remaining,
    };
  } catch (error) {
    console.error('Error checking feature gate:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Failed to check feature access' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Check if user can perform an action (create/update) based on current usage
 * @param userId - User ID
 * @param featureName - Feature name to check
 * @param currentCount - Current count of items (e.g., number of funnels)
 * @returns GateResult with allowed status
 */
export async function checkQuotaGate(
  userId: string,
  featureName: string,
  currentCount: number
): Promise<GateResult> {
  try {
    const result: RateLimitResult = await RateLimitService.checkFeatureAccess(
      userId,
      featureName
    );

    if (!result.allowed) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: result.message || 'Feature not available in your plan',
            limit: result.limit,
            remaining: result.remaining,
          },
          { status: 403 }
        ),
        limit: result.limit,
        remaining: result.remaining,
        message: result.message,
      };
    }

    // Check if user has reached their limit
    if (result.limit !== undefined && result.limit !== null) {
      const limit = typeof result.limit === 'number' ? result.limit : Infinity;
      if (currentCount >= limit) {
        return {
          allowed: false,
          response: NextResponse.json(
            {
              error: `You've reached your limit of ${limit} ${featureName}. Please upgrade your plan to create more.`,
              limit,
              current: currentCount,
              remaining: 0,
            },
            { status: 403 }
          ),
          limit,
          remaining: 0,
          message: `Limit of ${limit} reached`,
        };
      }
    }

    return {
      allowed: true,
      limit: result.limit,
      remaining: result.remaining !== undefined 
        ? result.remaining 
        : result.limit !== undefined && result.limit !== null
        ? Math.max(0, result.limit - currentCount)
        : undefined,
    };
  } catch (error) {
    console.error('Error checking quota gate:', error);
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Failed to check quota' },
        { status: 500 }
      ),
    };
  }
}

