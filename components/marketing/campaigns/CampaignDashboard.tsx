'use client';

/**
 * Campaign Dashboard Component
 * List view of all user campaigns with stats and actions
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPlus, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '@stackframe/stack';
import { fetchCampaignsAction } from '@/app/(main)/marketing/campaigns/actions';

interface Campaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED';
  sourceType: string;
  platforms: string[];
  createdAt: string;
  _count: {
    assets: number;
    scheduledPosts: number;
  };
  stats: {
    totalEngagement: number;
  };
}

export default function CampaignDashboard() {
  const router = useRouter();
  const user = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [creatingManual, setCreatingManual] = useState(false);

  const fetchCampaigns = useCallback(
    async (silent = false) => {
      if (!user?.id) {
        if (!silent) {
          setCampaigns([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (!silent) setLoading(true);
        const result = await fetchCampaignsAction({
          userId: user.id,
        });

        if (!result.success) {
          throw new Error(result.error.message);
        }

        setCampaigns(result.data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        if (!silent) {
          toast.error('Failed to load campaigns');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchCampaigns();
  }, [user?.id, fetchCampaigns]);

  useEffect(() => {
    // Check if any campaign is generating
    const hasGenerating = campaigns.some((c) => c.status === 'GENERATING');

    if (hasGenerating && !polling) {
      setPolling(true);
      const interval = setInterval(() => {
        fetchCampaigns(true);
      }, 5000);

      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }

    if (!hasGenerating && polling) {
      setPolling(false);
    }
  }, [campaigns, polling, fetchCampaigns]);

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      GENERATING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      TWITTER: '𝕏',
      INSTAGRAM: '📷',
      LINKEDIN: '💼',
      FACEBOOK: '👥',
      TIKTOK: '🎵',
      EMAIL: '📧',
    };
    return icons[platform] || '📱';
  };

  const handleCreateManualCampaign = async () => {
    if (!user?.id) {
      toast.error('You must be signed in to create a campaign');
      return;
    }

    const name = prompt('Enter campaign name:');
    if (!name || name.trim().length < 3) {
      if (name !== null) {
        toast.error('Campaign name must be at least 3 characters');
      }
      return;
    }

    setCreatingManual(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const data = await response.json();
      toast.success('Campaign created! You can now add assets manually.');
      router.push(`/marketing/campaigns/${data.campaignId}`);
    } catch (error: any) {
      console.error('Error creating manual campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setCreatingManual(false);
    }
  };

  const totalAssets = campaigns.reduce((sum, c) => sum + c._count.assets, 0);
  const totalEngagement = campaigns.reduce((sum, c) => sum + (c.stats?.totalEngagement || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'READY').length;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campaigns
        </h1>
        <p className="text-gray-600">
          AI-powered multi-channel marketing campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {campaigns.length}
          </div>
          <div className="text-sm text-gray-600">Total Campaigns</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {totalAssets}
          </div>
          <div className="text-sm text-gray-600">Total Assets</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {totalEngagement.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Engagement</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {activeCampaigns}
          </div>
          <div className="text-sm text-gray-600">Active Now</div>
        </div>
      </div>

      {/* Campaign List Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          <p className="text-sm text-gray-600">
            {campaigns.length} campaigns created
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateManualCampaign}
            disabled={creatingManual}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
          >
            <FiPlus />
            {creatingManual ? 'Creating...' : 'Create Manually'}
          </button>
          <Link
            href="/marketing/campaigns/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FiPlus />
            Generate with AI
          </Link>
        </div>
      </div>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No campaigns yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first AI-powered marketing campaign
          </p>
          <Link
            href="/marketing/campaigns/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FiPlus />
            Generate Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status === 'GENERATING' && (
                        <span className="inline-block animate-spin mr-1">⏳</span>
                      )}
                      {campaign.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{campaign._count.assets} assets</span>
                    {campaign._count.scheduledPosts > 0 && (
                      <>
                        <span>•</span>
                        <span>{campaign._count.scheduledPosts} scheduled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Platform Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    <span>{getPlatformIcon(platform)}</span>
                    {platform}
                  </span>
                ))}
              </div>

              {/* Engagement Stats */}
              {campaign.stats?.totalEngagement > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <FiBarChart2 className="text-green-600" />
                  <span className="font-medium text-green-600">
                    {campaign.stats.totalEngagement.toLocaleString()} total engagement
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/marketing/campaigns/${campaign.id}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-center transition-colors"
                >
                  View Assets
                </Link>
                {campaign.status === 'READY' && campaign._count.assets > 0 && (
                  <Link
                    href={`/marketing/schedule?campaign=${campaign.id}`}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    <FiCalendar />
                    Schedule
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
