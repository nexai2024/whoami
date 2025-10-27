import prisma from '@/lib/prisma';
import { useState, useCallback } from 'react';

/**
 * Check if a user has access to a specific feature based on their subscription plan
 * @param userId - The user's ID
 * @param featureName - The name of the feature to check (e.g., 'error_console_admin')
 * @returns Promise<boolean> - true if user has access to the feature, false otherwise
 */
export async function checkUserFeature(
  userId: string,
  featureName: string
): Promise<boolean> {
  try {
    // Get user's profile to determine their plan
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { plan: true },
    });

    if (!profile) {
      return false;
    }

    // Get the feature from the database
    const feature = await prisma.feature.findUnique({
      where: { name: featureName },
      select: { id: true },
    });

    if (!feature) {
      // Feature doesn't exist in database
      return false;
    }

    // Find the plan that matches the user's profile plan enum
    const plan = await prisma.plan.findFirst({
      where: { planEnum: profile.plan },
      select: { id: true },
    });

    if (!plan) {
      return false;
    }

    // Check if the plan has this feature enabled
    const planFeature = await prisma.planFeature.findUnique({
      where: {
        planId_featureId: {
          planId: plan.id,
          featureId: feature.id,
        },
      },
      select: { enabled: true },
    });

    return planFeature?.enabled ?? false;
  } catch (error) {
    console.error('Error checking user feature:', error);
    return false;
  }
}

/**
 * Client-side wrapper to check feature access via API
 * @param featureName - The name of the feature to check
 * @param incrementUsage - Whether to increment usage count (default: false)
 * @returns Promise<boolean> - true if user has access to the feature
 */
export async function checkFeatureClient(
  featureName: string, 
  incrementUsage: boolean = false
): Promise<boolean> {
  try {
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        featureName,
        incrementUsage
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('User not authenticated for feature check');
        return false;
      }
      console.error('Feature check API error:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return data.allowed ?? false;
  } catch (error) {
    console.error('Error checking feature on client:', error);
    return false;
  }
}

/**
 * React hook version that integrates with auth context
 * @param featureName - The name of the feature to check
 * @param incrementUsage - Whether to increment usage count (default: false)
 * @returns Promise<boolean> - true if user has access to the feature
 */
export function useCheckFeature(featureName: string, incrementUsage: boolean = false) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const access = await checkFeatureClient(featureName, incrementUsage);
      setHasAccess(access);
      return access;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [featureName, incrementUsage]);

  return {
    hasAccess,
    loading,
    error,
    checkAccess
  };
}
