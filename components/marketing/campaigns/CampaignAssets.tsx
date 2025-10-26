'use client';

/**
 * Campaign Assets Component
 * Display and manage all generated assets for a campaign
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCopy, FiCalendar, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CampaignAsset {
  id: string;
  type: 'SOCIAL_POST' | 'EMAIL' | 'PAGE_VARIANT' | 'IMAGE' | 'VIDEO_CLIP';
  platform: 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK' | 'TIKTOK' | 'EMAIL';
  content: string;
  metadata?: any;
  scheduledPostId?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  platforms: string[];
  _count: {
    assets: number;
    scheduledPosts: number;
  };
  stats: {
    totalEngagement: number;
  };
  assets: CampaignAsset[];
}

export default async function CampaignAssets() {
  const params = useParams();
  const router = useRouter();
  const campaignId = await params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'email' | 'pages'>('all');
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaign?.status === 'GENERATING' && !polling) {
      setPolling(true);
      const interval = setInterval(() => {
        fetchCampaign(true);
      }, 3000);

      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }
  }, [campaign?.status, polling]);

  const fetchCampaign = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();
      setCampaign(data.campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const getAssetTypeColor = (type: CampaignAsset['type']) => {
    const colors = {
      SOCIAL_POST: 'bg-blue-100 text-blue-800',
      EMAIL: 'bg-purple-100 text-purple-800',
      PAGE_VARIANT: 'bg-green-100 text-green-800',
      IMAGE: 'bg-orange-100 text-orange-800',
      VIDEO_CLIP: 'bg-pink-100 text-pink-800',
    };
    return colors[type];
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

  const filteredAssets = campaign?.assets.filter((asset) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'social') return asset.type === 'SOCIAL_POST';
    if (activeTab === 'email') return asset.type === 'EMAIL';
    if (activeTab === 'pages') return asset.type === 'PAGE_VARIANT';
    return true;
  }) || [];

  const assetCounts = {
    all: campaign?.assets.length || 0,
    social: campaign?.assets.filter((a) => a.type === 'SOCIAL_POST').length || 0,
    email: campaign?.assets.filter((a) => a.type === 'EMAIL').length || 0,
    pages: campaign?.assets.filter((a) => a.type === 'PAGE_VARIANT').length || 0,
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign not found</h2>
        <button
          onClick={() => router.push('/marketing/campaigns')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/marketing/campaigns')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft />
          <span className="text-sm">Back to Campaigns</span>
        </button>
      </div>

      {/* Campaign Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {campaign.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'READY' ? 'bg-green-100 text-green-800' :
                campaign.status === 'GENERATING' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{campaign._count.assets}</div>
            <div className="text-xs text-gray-600">Assets</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{campaign.stats?.totalEngagement || 0}</div>
            <div className="text-xs text-gray-600">Total Engagement</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{campaign._count.scheduledPosts}</div>
            <div className="text-xs text-gray-600">Scheduled</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {campaign._count.assets - campaign._count.scheduledPosts}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/marketing/schedule?campaign=${campaign.id}`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FiCalendar />
            Schedule All Assets
          </button>
        </div>
      </div>

      {/* Generating State */}
      {campaign.status === 'GENERATING' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <h3 className="font-semibold text-gray-900 mb-1">AI is generating your campaign assets...</h3>
          <p className="text-sm text-gray-600">This typically takes 30-60 seconds. This page will update automatically.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All Assets', count: assetCounts.all },
            { id: 'social', label: 'Social Posts', count: assetCounts.social },
            { id: 'email', label: 'Email', count: assetCounts.email },
            { id: 'pages', label: 'Pages', count: assetCounts.pages },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {campaign.status === 'GENERATING'
              ? 'Assets are being generated...'
              : 'No assets in this category'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              {/* Asset Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(asset.type)}`}>
                    {asset.type.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-700">
                    <span>{getPlatformIcon(asset.platform)}</span>
                    {asset.platform}
                  </span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {asset.content}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                <span>{asset.content.length} characters</span>
                {asset.scheduledPostId ? (
                  <span className="text-green-600 font-medium">✓ Scheduled</span>
                ) : (
                  <span className="text-gray-600">Not scheduled</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(asset.content)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  <FiCopy />
                  Copy
                </button>
                <button
                  onClick={() => router.push(`/marketing/schedule?asset=${asset.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  <FiCalendar />
                  Schedule
                </button>
                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <FiEdit2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
