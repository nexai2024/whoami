'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@stackframe/stack";
import { FiZap, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface WorkflowAnalyticsPageProps {
  params: {
    workflowId: string;
  };
}

export default function WorkflowAnalyticsPage({ params }: WorkflowAnalyticsPageProps) {
  const user = useUser();
  const { workflowId } = params;
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, workflowId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/${workflowId}/analytics`, {
        headers: {
          'x-user-id': user?.id || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to view workflow analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <FiZap className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No data yet</h2>
            <p className="text-gray-600 mb-6">
              Analytics will appear here once the workflow has been executed.
            </p>
            <Link
              href={`/workflows/${workflowId}/edit`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Edit Workflow
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Runs',
      value: analytics.totalRuns.toLocaleString(),
      icon: FiZap,
      color: 'blue'
    },
    {
      label: 'Successful',
      value: analytics.successfulRuns.toLocaleString(),
      icon: FiCheckCircle,
      color: 'green'
    },
    {
      label: 'Failed',
      value: analytics.failedRuns.toLocaleString(),
      icon: FiXCircle,
      color: 'red'
    },
    {
      label: 'Success Rate',
      value: `${analytics.successRate.toFixed(1)}%`,
      icon: FiCheckCircle,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/workflows/${workflowId}/edit`}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Workflow
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Analytics</h1>
          <p className="text-gray-600 mt-1">{analytics.workflowName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`text-${stat.color}-600 text-xl`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {analytics.lastRunAt && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Last Run</h2>
            <p className="text-gray-600">
              {new Date(analytics.lastRunAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
