"use client";
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { checkFeatureClient } from '@/lib/features/checkFeature';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiZap, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface ContentGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  requiredPlan?: string;
  onAccessDenied?: () => void;
}

interface FeatureAccess {
  allowed: boolean;
  loading: boolean;
  limit?: number;
  remaining?: number;
  message?: string;
}

/**
 * Client-side content gating component
 * Wraps content and only shows it if user has access to the feature
 */
export function ContentGate({
  featureName,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredPlan = 'Pro',
  onAccessDenied,
}: ContentGateProps) {
  const { currUser } = useAuth();
  const [access, setAccess] = useState<FeatureAccess>({
    allowed: false,
    loading: true,
  });
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!currUser?.id) {
        setAccess({ allowed: false, loading: false });
        return;
      }

      try {
        const response = await fetch('/api/features/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featureName }),
        });

        if (response.ok) {
          const data = await response.json();
          setAccess({
            allowed: data.allowed || false,
            loading: false,
            limit: data.limit,
            remaining: data.remaining,
            message: data.message,
          });

          if (!data.allowed && onAccessDenied) {
            onAccessDenied();
          }
        } else {
          setAccess({ allowed: false, loading: false });
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setAccess({ allowed: false, loading: false });
      }
    }

    checkAccess();
  }, [currUser?.id, featureName, onAccessDenied]);

  if (access.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!access.allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <FiLock className="text-3xl text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {featureName.charAt(0).toUpperCase() + featureName.slice(1)} Not Available
          </h3>
          <p className="text-gray-600 mb-4">
            {access.message || `This feature requires a ${requiredPlan} plan or higher.`}
          </p>
          {access.limit !== undefined && (
            <p className="text-sm text-gray-500 mb-4">
              Your current plan allows {access.limit} {featureName}.
              {access.remaining !== undefined && access.remaining > 0 && (
                <span> You have {access.remaining} remaining.</span>
              )}
            </p>
          )}
          {showUpgradePrompt && (
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiZap />
              Upgrade Plan
            </Link>
          )}
        </div>

        <AnimatePresence>
          {showPrompt && (
            <UpgradePrompt
              featureName={featureName}
              requiredPlan={requiredPlan}
              onClose={() => setShowPrompt(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return <>{children}</>;
}

/**
 * Upgrade prompt modal component
 */
function UpgradePrompt({
  featureName,
  requiredPlan,
  onClose,
}: {
  featureName: string;
  requiredPlan: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Upgrade Required</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          {featureName.charAt(0).toUpperCase() + featureName.slice(1)} is available on the{' '}
          <span className="font-semibold">{requiredPlan}</span> plan and higher.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Link
            href="/settings/billing"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
            onClick={onClose}
          >
            View Plans
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hook to check feature access
 */
export function useFeatureGate(featureName: string) {
  const { currUser } = useAuth();
  const [access, setAccess] = useState<FeatureAccess>({
    allowed: false,
    loading: true,
  });

  useEffect(() => {
    async function checkAccess() {
      if (!currUser?.id) {
        setAccess({ allowed: false, loading: false });
        return;
      }

      try {
        const allowed = await checkFeatureClient(featureName);
        setAccess({ allowed, loading: false });
      } catch (error) {
        console.error('Error checking feature access:', error);
        setAccess({ allowed: false, loading: false });
      }
    }

    checkAccess();
  }, [currUser?.id, featureName]);

  return access;
}

