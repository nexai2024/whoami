'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  FiTrendingUp, FiUsers, FiTarget, FiArrowRight, FiArrowLeft, FiEye, FiCheck
} from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { useAuth } from '@/lib/auth/AuthContext.jsx';

interface FunnelAnalytics {
  funnel: {
    id: string;
    name: string;
    totalVisits: number;
    totalConversions: number;
    conversionRate: number;
  };
  steps: Array<{
    id: string;
    name: string;
    order: number;
    views: number;
    completions: number;
    dropoffCount: number;
    dropoffRate: number;
    conversionRate: number;
  }>;
  recentVisits: Array<{
    id: string;
    email?: string;
    createdAt: string;
    completedSteps: number;
    converted: boolean;
  }>;
}

export default function FunnelAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { currUser } = useAuth();
  const funnelId = params.id as string;

  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    if (currUser && funnelId) {
      loadAnalytics();
    }
  }, [currUser, funnelId, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}/analytics?timeframe=${timeframe}`, {
        headers: { 'x-user-id': currUser.id },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No analytics available</h1>
          <button
            onClick={() => router.push(`/funnels/${funnelId}/edit`)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push(`/funnels/${funnelId}/edit`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <SafeIcon name={undefined} icon={FiArrowLeft} />
                Back to Editor
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{analytics.funnel.name} - Analytics</h1>
            </div>
            <div className="flex items-center gap-2">
              {['24h', '7d', '30d', 'all'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border'
                  }`}
                >
                  {tf === '24h' ? 'Last 24h' : tf === '7d' ? 'Last 7 days' : tf === '30d' ? 'Last 30 days' : 'All time'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <SafeIcon name={undefined} icon={FiUsers} className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Visitors</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.funnel.totalVisits}</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <SafeIcon name={undefined} icon={FiTarget} className="text-green-600 text-xl" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Conversions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.funnel.totalConversions}</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <SafeIcon name={undefined} icon={FiTrendingUp} className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.funnel.conversionRate?.toFixed(1) || '0'}%
            </p>
          </motion.div>
        </div>

        {/* Funnel Visualization */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Funnel Flow</h2>

          <div className="space-y-4">
            {analytics.steps.map((step, index) => {
              const widthPercentage = step.views > 0
                ? (step.views / analytics.steps[0].views) * 100
                : 100;

              return (
                <div key={step.id} className="relative">
                  {/* Step Bar */}
                  <div
                    className="relative bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg p-6 transition-all"
                    style={{
                      width: `${widthPercentage}%`,
                      minWidth: '300px',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.name}</h3>
                          <p className="text-sm text-white/80">{step.views} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{step.completions}</p>
                        <p className="text-sm text-white/80">completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <SafeIcon name={undefined} icon={FiCheck} className="text-green-600" />
                      <span>Conversion: {step.conversionRate?.toFixed(1)}%</span>
                    </div>
                    {step.dropoffRate > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-red-600">Drop-off: {step.dropoffRate?.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow to next step */}
                  {index < analytics.steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <SafeIcon name={undefined} icon={FiArrowRight} className="text-gray-400 rotate-90 text-2xl" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Visits */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Visitors</h2>

          {analytics.recentVisits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No visitors yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentVisits.map(visit => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {visit.email || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(visit.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {visit.completedSteps} of {analytics.steps.length} steps
                    </p>
                    {visit.converted && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <SafeIcon name={undefined} icon={FiCheck} />
                        Converted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
