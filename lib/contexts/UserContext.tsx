"use client"
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from "@stackframe/stack";
import { logger } from '../utils/logger';
import { onboardingComplete, initOnboardingUser } from '@/app/(main)/onboarding-functions';
import { RateLimitResult } from '../rate-limit';

/**
 * User Context - Centralized authorization, feature gating, and rate limiting
 * 
 * This context provides:
 * - Authentication state and user data
 * - Feature access checking with caching
 * - Rate limiting checks
 * - Subscription and plan information
 * - Authorization helpers
 * - Usage tracking
 */

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    planEnum: string;
    features: Array<{
      featureId: string;
      enabled: boolean;
      limit: number | null;
      rateLimit: number | null;
      ratePeriod: string | null;
      feature: {
        id: string;
        name: string;
        type: string;
      };
    }>;
  };
}

interface FeatureAccessCache {
  [featureName: string]: {
    result: RateLimitResult;
    timestamp: number;
  };
}

interface UserContextType {
  // Authentication
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  userId: string | null;
  
  // Subscription & Plan
  subscription: Subscription | null;
  planName: string | null;
  isLoadingSubscription: boolean;
  refreshSubscription: () => Promise<void>;
  
  // Feature Access
  checkFeature: (featureName: string, incrementUsage?: boolean) => Promise<RateLimitResult>;
  hasFeature: (featureName: string) => Promise<boolean>;
  getFeatureLimit: (featureName: string) => Promise<{ limit: number | null; remaining: number | null }>;
  
  // Cached feature checks (for UI rendering)
  featureCache: FeatureAccessCache;
  clearFeatureCache: () => void;
  
  // Authorization helpers
  canAccess: (resourceUserId: string) => boolean;
  isOwner: (resourceUserId: string) => boolean;
  isAdmin: boolean;
  
  // User actions
  logout: () => void;
  completeOnboarding: () => void;
  
  // Rate limiting
  checkRateLimit: (featureName: string) => Promise<RateLimitResult>;
  incrementUsage: (featureName: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const FEATURE_CACHE_TTL = 60000; // 1 minute cache

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stackUser = useUser();
  const isSignedIn = !!stackUser;
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  // Feature access cache
  const [featureCache, setFeatureCache] = useState<FeatureAccessCache>({});
  
  // Admin status
  const [isAdmin, setIsAdmin] = useState(false);
  
  const userId = user?.id || null;

  // Initialize authentication
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        if (stackUser && isSignedIn) {
          setIsAuthenticated(true);
          setUser(stackUser);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        logger.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuthStatus();
  }, [stackUser, isSignedIn]);

  // Initialize user metadata
  useEffect(() => {
    async function initUser() {
      if (stackUser && isSignedIn) {
        setUser(stackUser);
        setIsAuthenticated(true);
        try {
          if (!stackUser.clientReadOnlyMetadata) {
            await initOnboardingUser();
          }
        } catch (error) {
          logger.error('Error initializing user metadata:', error);
        }
      }
    }
    initUser();
  }, [stackUser, isSignedIn]);

  // Load subscription when user changes
  useEffect(() => {
    if (userId) {
      refreshSubscription();
      checkAdminStatus();
    } else {
      setSubscription(null);
      setIsAdmin(false);
    }
  }, [userId]);

  // Check admin status
  const checkAdminStatus = useCallback(async () => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const result = await checkFeatureInternal('error_console_admin', false);
      setIsAdmin(result.allowed || false);
    } catch (error) {
      logger.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [userId]);

  // Internal feature check (with caching)
  const checkFeatureInternal = useCallback(async (
    featureName: string,
    incrementUsage: boolean = false
  ): Promise<RateLimitResult> => {
    if (!userId) {
      return {
        allowed: false,
        message: 'User not authenticated'
      };
    }

    // Check cache first
    const cached = featureCache[featureName];
    if (cached && Date.now() - cached.timestamp < FEATURE_CACHE_TTL && !incrementUsage) {
      return cached.result;
    }

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
          return {
            allowed: false,
            message: 'User not authenticated'
          };
        }
        throw new Error(`Feature check failed: ${response.statusText}`);
      }

      const result: RateLimitResult = await response.json();
      
      // Update cache (only if not incrementing usage)
      if (!incrementUsage) {
        setFeatureCache(prev => ({
          ...prev,
          [featureName]: {
            result,
            timestamp: Date.now()
          }
        }));
      }
      
      return result;
    } catch (error) {
      logger.error('Error checking feature:', error);
      return {
        allowed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [userId, featureCache]);

  // Public API: Check feature access
  const checkFeature = useCallback(async (
    featureName: string,
    incrementUsage: boolean = false
  ): Promise<RateLimitResult> => {
    return checkFeatureInternal(featureName, incrementUsage);
  }, [checkFeatureInternal]);

  // Public API: Check if user has feature (boolean)
  const hasFeature = useCallback(async (featureName: string): Promise<boolean> => {
    const result = await checkFeatureInternal(featureName, false);
    return result.allowed || false;
  }, [checkFeatureInternal]);

  // Public API: Get feature limit info
  const getFeatureLimit = useCallback(async (
    featureName: string
  ): Promise<{ limit: number | null; remaining: number | null }> => {
    const result = await checkFeatureInternal(featureName, false);
    return {
      limit: result.limit ?? null,
      remaining: result.remaining ?? null
    };
  }, [checkFeatureInternal]);

  // Public API: Check rate limit
  const checkRateLimit = useCallback(async (featureName: string): Promise<RateLimitResult> => {
    return checkFeatureInternal(featureName, false);
  }, [checkFeatureInternal]);

  // Public API: Increment usage
  const incrementUsage = useCallback(async (featureName: string): Promise<void> => {
    if (!userId) return;
    
    try {
      await fetch('/api/features/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureName,
          incrementUsage: true
        })
      });
      
      // Clear cache for this feature to force refresh
      setFeatureCache(prev => {
        const next = { ...prev };
        delete next[featureName];
        return next;
      });
    } catch (error) {
      logger.error('Error incrementing usage:', error);
    }
  }, [userId]);

  // Clear feature cache
  const clearFeatureCache = useCallback(() => {
    setFeatureCache({});
  }, []);

  // Load subscription
  const refreshSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      return;
    }

    setIsLoadingSubscription(true);
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      logger.error('Error loading subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [userId]);

  // Authorization helpers
  const canAccess = useCallback((resourceUserId: string): boolean => {
    return userId === resourceUserId || isAdmin;
  }, [userId, isAdmin]);

  const isOwner = useCallback((resourceUserId: string): boolean => {
    return userId === resourceUserId;
  }, [userId]);

  // User actions
  const logout = useCallback(() => {
    if (stackUser && typeof stackUser.signOut === 'function') {
      stackUser.signOut();
    }
    setIsAuthenticated(false);
    setUser(null);
    setSubscription(null);
    setFeatureCache({});
    setIsAdmin(false);
    logger.info('User logged out successfully');
  }, [stackUser]);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('onboardingComplete', 'true');
    setUser((prev: any) => ({
      ...prev,
      onboardingComplete: true
    }));
    logger.info('Onboarding completed');
  }, []);

  // Memoized plan name
  const planName = useMemo(() => {
    return subscription?.plan?.planEnum || subscription?.plan?.name || null;
  }, [subscription]);

  const value: UserContextType = {
    // Authentication
    isAuthenticated,
    user,
    loading,
    userId,
    
    // Subscription & Plan
    subscription,
    planName,
    isLoadingSubscription,
    refreshSubscription,
    
    // Feature Access
    checkFeature,
    hasFeature,
    getFeatureLimit,
    
    // Cache
    featureCache,
    clearFeatureCache,
    
    // Authorization
    canAccess,
    isOwner,
    isAdmin,
    
    // User actions
    logout,
    completeOnboarding,
    
    // Rate limiting
    checkRateLimit,
    incrementUsage,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

