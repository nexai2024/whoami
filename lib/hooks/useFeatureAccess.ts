import { useState, useCallback } from 'react';

/**
 * Hook for checking feature access based on subscription
 * Integrates with POST /api/features/check endpoint
 */

interface FeatureCheckResponse {
  allowed: boolean;
  reason: string;
  usage?: {
    used: number;
    limit: number;
  };
}

interface UseFeatureAccessReturn {
  canAccessFeature: (featureName: string) => Promise<boolean>;
  checkLimit: (featureName: string) => Promise<{
    canUse: boolean;
    used: number;
    limit: number;
  }>;
  loading: boolean;
  error: string | null;
}

export function useFeatureAccess(userId?: string): UseFeatureAccessReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = userId || 'demo-user'; // TODO: Get from auth context

  const canAccessFeature = useCallback(async (featureName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/features/check', {
        method: 'POST',
        headers: {
          'x-user-id': effectiveUserId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureName,
          action: 'check'
        })
      });

      if (response.ok) {
        const data: FeatureCheckResponse = await response.json();
        return data.allowed;
      } else {
        setError('Failed to check feature access');
        return false;
      }
    } catch (err) {
      setError('Error checking feature access');
      return false;
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const checkLimit = useCallback(async (featureName: string): Promise<{
    canUse: boolean;
    used: number;
    limit: number;
  }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/features/check', {
        method: 'POST',
        headers: {
          'x-user-id': effectiveUserId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureName,
          action: 'check'
        })
      });

      if (response.ok) {
        const data: FeatureCheckResponse = await response.json();
        return {
          canUse: data.allowed,
          used: data.usage?.used || 0,
          limit: data.usage?.limit || 0
        };
      } else {
        setError('Failed to check feature limits');
        return {
          canUse: false,
          used: 0,
          limit: 0
        };
      }
    } catch (err) {
      setError('Error checking feature limits');
      return {
        canUse: false,
        used: 0,
        limit: 0
      };
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  return {
    canAccessFeature,
    checkLimit,
    loading,
    error
  };
}

/**
 * Utility component for showing upgrade prompts
 */
export function UpgradePrompt({
  featureName,
  requiredPlan = 'Pro',
  onClose
}: {
  featureName: string;
  requiredPlan?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upgrade Required
        </h2>
        <p className="text-gray-700 mb-6">
          This feature requires the {requiredPlan} plan. Upgrade to unlock {featureName} and other premium features.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Maybe Later
          </button>
          <a
            href="/settings/billing"
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition text-center"
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}
