"use client"
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
    const result = await fetch('/api/features/check', {
      method: 'POST',
      body: JSON.stringify({ featureName }),
    });

    if (!result.ok) {
      return false;
    }

    const data = await result.json();
    return data.allowed ?? false;
  } catch (error) {
    console.error('Error checking user feature:', error);
    return false;
  }
}

    // Get user's profile to determine their plan
   
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
