"use client"
import { useUserContext } from '../contexts/UserContext';
import { useState, useEffect, useCallback } from 'react';
import { RateLimitResult } from '../rate-limit';

/**
 * Hook for feature gating with automatic checking
 * Useful for conditionally rendering UI based on feature access
 */
export function useFeatureGate(
  featureName: string,
  options: {
    autoCheck?: boolean;
    incrementUsage?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const {
    checkFeature,
    hasFeature,
    getFeatureLimit,
    featureCache,
    clearFeatureCache
  } = useUserContext();

  const {
    autoCheck = true,
    incrementUsage = false,
    refreshInterval
  } = options;

  const [result, setResult] = useState<RateLimitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const featureResult = await checkFeature(featureName, incrementUsage);
      setResult(featureResult);
      return featureResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setResult({
        allowed: false,
        message: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkFeature, featureName, incrementUsage]);

  useEffect(() => {
    if (autoCheck) {
      check();
    }
  }, [autoCheck, check]);

  // Auto-refresh if interval is set
  useEffect(() => {
    if (refreshInterval && autoCheck) {
      const interval = setInterval(() => {
        check();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, autoCheck, check]);

  // Check cached result
  const cachedResult = featureCache[featureName];
  const hasAccess = result?.allowed || cachedResult?.result.allowed || false;
  const limit = result?.limit ?? cachedResult?.result.limit ?? null;
  const remaining = result?.remaining ?? cachedResult?.result.remaining ?? null;

  return {
    hasAccess,
    limit,
    remaining,
    result,
    loading,
    error,
    check,
    refresh: check,
  };
}

/**
 * Hook for checking multiple features at once
 */
export function useFeatureGates(
  featureNames: string[],
  options: {
    autoCheck?: boolean;
    incrementUsage?: boolean;
  } = {}
) {
  const { checkFeature } = useUserContext();
  const [results, setResults] = useState<Record<string, RateLimitResult>>({});
  const [loading, setLoading] = useState(false);

  const checkAll = useCallback(async () => {
    setLoading(true);
    try {
      const checks = featureNames.map(name => 
        checkFeature(name, options.incrementUsage).then(result => ({ name, result }))
      );
      const resolved = await Promise.all(checks);
      const resultsMap = resolved.reduce((acc, { name, result }) => {
        acc[name] = result;
        return acc;
      }, {} as Record<string, RateLimitResult>);
      setResults(resultsMap);
    } catch (error) {
      console.error('Error checking features:', error);
    } finally {
      setLoading(false);
    }
  }, [checkFeature, featureNames, options.incrementUsage]);

  useEffect(() => {
    if (options.autoCheck !== false) {
      checkAll();
    }
  }, [options.autoCheck, checkAll]);

  const hasAllFeatures = Object.values(results).every(r => r.allowed);
  const hasAnyFeature = Object.values(results).some(r => r.allowed);

  return {
    results,
    loading,
    hasAllFeatures,
    hasAnyFeature,
    checkAll,
    refresh: checkAll,
  };
}

