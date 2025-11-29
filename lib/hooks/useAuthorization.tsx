"use client"
import { useUserContext } from '../contexts/UserContext';
import { useCallback } from 'react';

/**
 * Hook for authorization checks
 * Provides convenient methods for checking user permissions
 */
export function useAuthorization() {
  const {
    userId,
    isAuthenticated,
    canAccess,
    isOwner,
    isAdmin,
    checkFeature,
    hasFeature,
    getFeatureLimit,
    subscription,
    planName
  } = useUserContext();

  /**
   * Check if user can access a resource
   */
  const canAccessResource = useCallback((resourceUserId: string): boolean => {
    return canAccess(resourceUserId);
  }, [canAccess]);

  /**
   * Check if user owns a resource
   */
  const ownsResource = useCallback((resourceUserId: string): boolean => {
    return isOwner(resourceUserId);
  }, [isOwner]);

  /**
   * Check if user has a feature
   */
  const hasFeatureAccess = useCallback(async (featureName: string): Promise<boolean> => {
    return hasFeature(featureName);
  }, [hasFeature]);

  /**
   * Check feature with full details
   */
  const checkFeatureAccess = useCallback(async (
    featureName: string,
    incrementUsage?: boolean
  ) => {
    return checkFeature(featureName, incrementUsage);
  }, [checkFeature]);

  /**
   * Get feature limit info
   */
  const getFeatureLimitInfo = useCallback(async (featureName: string) => {
    return getFeatureLimit(featureName);
  }, [getFeatureLimit]);

  /**
   * Check if user is on a specific plan
   */
  const isOnPlan = useCallback((plan: string): boolean => {
    if (!planName) return false;
    return planName.toUpperCase().includes(plan.toUpperCase());
  }, [planName]);

  /**
   * Check if user has active subscription
   */
  const hasActiveSubscription = useCallback((): boolean => {
    return subscription?.status === 'active' || false;
  }, [subscription]);

  return {
    // Auth state
    userId,
    isAuthenticated,
    isAdmin,
    
    // Authorization
    canAccessResource,
    ownsResource,
    
    // Feature access
    hasFeatureAccess,
    checkFeatureAccess,
    getFeatureLimitInfo,
    
    // Subscription
    subscription,
    planName,
    isOnPlan,
    hasActiveSubscription,
  };
}

