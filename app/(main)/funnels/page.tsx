'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { useAuth } from '@/lib/auth/AuthContext.jsx';
import toast from 'react-hot-toast';
import { ContentGate, useFeatureGate } from '@/components/gating/ContentGate';

interface Funnel {
  id: string;
  name: string;
  description?: string;
  slug: string;
  goalType: string;
  status: string;
  totalVisits: number;
  totalConversions: number;
  conversionRate?: number;
  createdAt: string;
  updatedAt: string;
  steps: any[];
  _count: {
    visits: number;
    conversions: number;
  };
}

const FunnelsPage = () => {
  const { currUser } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'DRAFT'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFunnel, setNewFunnel] = useState({
    name: '',
    description: '',
    slug: '',
    goalType: 'LEAD_CAPTURE',
    conversionGoal: 'email_signup',
  });
  const funnelAccess = useFeatureGate('funnels');

  useEffect(() => {
    if (currUser) {
      loadFunnels();
    }
  }, [currUser, filter]);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/funnels?${params.toString()}`, {
        headers: {
          'x-user-id': currUser.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels || []);
      } else {
        toast.error('Failed to load funnels');
      }
    } catch (error) {
      console.error('Error loading funnels:', error);
      toast.error('Failed to load funnels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check access before creating
    if (!funnelAccess.allowed) {
      toast.error('Funnels are not available in your plan. Please upgrade to create funnels.');
      return;
    }

    // Check quota
    const response = await fetch('/api/features/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        featureName: 'funnels',
        incrementUsage: false 
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.allowed) {
        toast.error(data.message || 'You have reached your funnel limit. Please upgrade your plan.');
        return;
      }
      if (data.remaining !== undefined && data.remaining <= 0) {
        toast.error('You have reached your funnel limit. Please upgrade your plan.');
        return;
      }
    }

    try {
      const createResponse = await fetch('/api/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify(newFunnel),
      });

      if (createResponse.ok) {
        toast.success('Funnel created successfully');
        setShowCreateModal(false);
        setNewFunnel({
          name: '',
          description: '',
          slug: '',
          goalType: 'LEAD_CAPTURE',
          conversionGoal: 'email_signup',
        });
        loadFunnels();
      } else {
        const error = await createResponse.json();
        toast.error(error.error || 'Failed to create funnel');
      }
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('Failed to create funnel');
    }
  };

  const handleDeleteFunnel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this funnel?')) {
      return;
    }

    try {
      const response = await fetch(`/api/funnels/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currUser.id,
        },
      });

      if (response.ok) {
        toast.success('Funnel deleted successfully');
        loadFunnels();
      } else {
        toast.error('Failed to delete funnel');
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error('Failed to delete funnel');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.DRAFT}`}>
        {status.toLowerCase()}
      </span>
    );
  };

  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view your funnels.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentGate
      featureName="funnels"
      requiredPlan="Basic"
      showUpgradePrompt={true}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <SafeIcon name={undefined} icon={FiTrendingUp} className="text-indigo-600 text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Conversion Funnels</h1>
                </div>
                <p className="text-gray-600">
                  Create multi-step funnels to guide visitors to conversion
                </p>
                {funnelAccess.remaining !== undefined && (
                  <p className="text-sm text-gray-500 mt-2">
                    {funnelAccess.remaining} of {funnelAccess.limit} funnels remaining
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  if (!funnelAccess.allowed) {
                    toast.error('Funnels are not available in your plan. Please upgrade.');
                    return;
                  }
                  setShowCreateModal(true);
                }}
                disabled={!funnelAccess.allowed || (funnelAccess.remaining !== undefined && funnelAccess.remaining <= 0)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon name={undefined} icon={FiPlus} />
                Create Funnel
              </button>
            </div>
          </motion.div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Funnels
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'DRAFT'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Funnels Grid */}
        {funnels.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <SafeIcon name={undefined} icon={FiTrendingUp} className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No funnels yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first conversion funnel to start capturing leads and driving sales
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined} icon={FiPlus} />
              Create Your First Funnel
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnels.map((funnel, index) => (
              <motion.div
                key={funnel.id}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(funnel.status)}
                    <span className="text-xs text-gray-500">{funnel.steps.length} steps</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{funnel.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {funnel.description || 'No description'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-500">Visits</div>
                      <div className="font-semibold text-gray-900">{funnel._count.visits}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Conversions</div>
                      <div className="font-semibold text-gray-900">{funnel._count.conversions}</div>
                    </div>
                  </div>

                  {funnel.conversionRate !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Conversion Rate</span>
                        <span className="font-semibold text-indigo-600">
                          {funnel.conversionRate?.toFixed(1) || '0'}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${funnel.conversionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/funnels/${funnel.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <SafeIcon name={undefined} icon={FiEdit3} />
                      Edit
                    </Link>
                    <Link
                      href={`/funnels/${funnel.id}/analytics`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors border rounded-lg"
                      title="View Analytics"
                    >
                      <SafeIcon name={undefined} icon={FiBarChart2} />
                    </Link>
                    <a
                      href={`/f/${funnel.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors border rounded-lg"
                      title="View Funnel"
                    >
                      <SafeIcon name={undefined} icon={FiEye} />
                    </a>
                    <button
                      onClick={() => handleDeleteFunnel(funnel.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors border rounded-lg"
                      title="Delete"
                    >
                      <SafeIcon name={undefined} icon={FiTrash2} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Funnel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Funnel</h2>
            <form onSubmit={handleCreateFunnel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funnel Name *
                </label>
                <input
                  type="text"
                  value={newFunnel.name}
                  onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={newFunnel.slug}
                  onChange={(e) =>
                    setNewFunnel({ ...newFunnel, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="my-funnel-slug"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type *
                </label>
                <select
                  value={newFunnel.goalType}
                  onChange={(e) => setNewFunnel({ ...newFunnel, goalType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="LEAD_CAPTURE">Lead Capture</option>
                  <option value="PRODUCT_SALE">Product Sale</option>
                  <option value="COURSE_ENROLLMENT">Course Enrollment</option>
                  <option value="BOOKING">Booking</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newFunnel.description}
                  onChange={(e) => setNewFunnel({ ...newFunnel, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Funnel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </ContentGate>
  );
};

export default FunnelsPage;
