'use client';

/**
 * Campaign Assets Component
 * Display and manage all generated assets for a campaign
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCopy, FiCalendar, FiEdit2, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '@stackframe/stack';

interface CampaignAsset {
  id: string;
  type: 'SOCIAL_POST' | 'EMAIL' | 'PAGE_VARIANT' | 'IMAGE' | 'VIDEO_CLIP';
  platform: 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK' | 'TIKTOK' | 'EMAIL' | null;
  content: string;
  mediaUrl?: string | null;
  status: 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledAt?: string | null;
  publishedAt?: string | null;
  performance?: {
    views?: number | null;
    clicks?: number | null;
    conversions?: number | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
  };
}

interface Campaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED';
  createdAt: string;
  goal?: string | null;
  targetAudience?: string | null;
  assets: CampaignAsset[];
}

type AssetTab = 'all' | 'social' | 'email' | 'pages';

export default function CampaignAssets() {
  const router = useRouter();
  const params = useParams();
  const campaignIdParam = params?.['id'];
  const campaignId = Array.isArray(campaignIdParam) ? campaignIdParam[0] : campaignIdParam;
  const user = useUser();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AssetTab>('all');
  const [polling, setPolling] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CampaignAsset | null>(null);

  const fetchCampaign = useCallback(
    async (silent = false) => {
      if (!campaignId || !user?.id) {
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      try {
        if (!silent) setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          headers: {
            'x-user-id': user.id,
          },
        });

        if (response.status === 404) {
          setCampaign(null);
          if (!silent) {
            toast.error('Campaign not found');
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load campaign: ${response.status}`);
        }

        const data = await response.json();
        setCampaign(data.campaign ?? null);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        if (!silent) {
          toast.error('Failed to load campaign');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [campaignId, user?.id]
  );

  useEffect(() => {
    if (!campaignId || !user?.id) {
      setLoading(false);
      return;
    }

    fetchCampaign();
  }, [campaignId, user?.id, fetchCampaign]);

  useEffect(() => {
    if (campaign?.status !== 'GENERATING') {
      setPolling(false);
      return;
    }

    setPolling(true);
    const interval = setInterval(() => {
      fetchCampaign(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [campaign?.status, fetchCampaign]);

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

  const getPlatformIcon = (platform: CampaignAsset['platform']) => {
    const icons: Record<string, string> = {
      TWITTER: '𝕏',
      INSTAGRAM: '📷',
      LINKEDIN: '💼',
      FACEBOOK: '👥',
      TIKTOK: '🎵',
      EMAIL: '📧',
    };
    if (!platform) return '📱';
    return icons[platform] || '📱';
  };

  const totalAssets = useMemo(
    () => (campaign?.assets ? campaign.assets.length : 0),
    [campaign]
  );

  const scheduledCount = useMemo(
    () =>
      campaign?.assets
        ? campaign.assets.filter((asset) => asset.status === 'SCHEDULED').length
        : 0,
    [campaign]
  );

  const totalEngagement = useMemo(() => {
    if (!campaign?.assets) {
      return 0;
    }

    return campaign.assets.reduce((sum, asset) => {
      const metrics = [
        asset.performance?.views,
        asset.performance?.clicks,
        asset.performance?.conversions,
        asset.performance?.likes,
        asset.performance?.comments,
        asset.performance?.shares,
      ];

      return (
        sum +
        metrics.reduce((metricSum: number, value) => metricSum + (value ?? 0), 0)
      );
    }, 0);
  }, [campaign]);

  const pendingCount = Math.max(totalAssets - scheduledCount, 0);

  const filteredAssets = useMemo(() => {
    if (!campaign?.assets) {
      return [];
    }

    switch (activeTab) {
      case 'social':
        return campaign.assets.filter((asset) => asset.type === 'SOCIAL_POST');
      case 'email':
        return campaign.assets.filter((asset) => asset.type === 'EMAIL');
      case 'pages':
        return campaign.assets.filter((asset) => asset.type === 'PAGE_VARIANT');
      default:
        return campaign.assets;
    }
  }, [campaign, activeTab]);

  const assetCounts = useMemo(
    () => ({
      all: campaign?.assets ? campaign.assets.length : 0,
      social: campaign?.assets
        ? campaign.assets.filter((a) => a.type === 'SOCIAL_POST').length
        : 0,
      email: campaign?.assets
        ? campaign.assets.filter((a) => a.type === 'EMAIL').length
        : 0,
      pages: campaign?.assets
        ? campaign.assets.filter((a) => a.type === 'PAGE_VARIANT').length
        : 0,
    }),
    [campaign]
  );

  const renderPerformanceMetrics = (asset: CampaignAsset) => {
    if (asset.status !== 'PUBLISHED' || !asset.performance) {
      return null;
    }

    const entries = [
      { icon: '👁', label: 'views', value: asset.performance.views },
      { icon: '🖱', label: 'clicks', value: asset.performance.clicks },
      { icon: '✅', label: 'conversions', value: asset.performance.conversions },
      { icon: '💗', label: 'likes', value: asset.performance.likes },
      { icon: '💬', label: 'comments', value: asset.performance.comments },
      { icon: '🔁', label: 'shares', value: asset.performance.shares },
    ].filter(
      (entry) => entry.value !== undefined && entry.value !== null
    );

    if (entries.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        {entries.map((entry) => (
          <span key={entry.label} className="flex items-center gap-1">
            <span>{entry.icon}</span>
            <span className="font-medium">
              {entry.value?.toLocaleString() ?? 0}
            </span>
            <span>{entry.label}</span>
          </span>
        ))}
      </div>
    );
  };

  if (!user?.id) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Sign in required
        </h2>
        <p className="text-gray-600">
          Please sign in to view campaign assets.
        </p>
      </div>
    );
  }

  if (!campaignId) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Campaign not found
        </h2>
        <button
          onClick={() => router.push('/marketing/campaigns')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Campaigns
        </button>
      </div>
    );
  }

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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Campaign not found
        </h2>
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
              <span>
                Created {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'READY'
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === 'GENERATING'
                    ? 'bg-blue-100 text-blue-800'
                    : campaign.status === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {campaign.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{totalAssets}</div>
            <div className="text-xs text-gray-600">Assets</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {totalEngagement.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Engagement</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {scheduledCount}
            </div>
            <div className="text-xs text-gray-600">Scheduled</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {pendingCount}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            <FiPlus />
            Add Asset Manually
          </button>
          {campaign.assets.length > 0 && (
            <button
              onClick={() =>
                router.push(`/marketing/schedule?campaign=${campaign.id}`)
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <FiCalendar />
              Schedule All Assets
            </button>
          )}
        </div>
      </div>

      {/* Generating State */}
      {campaign.status === 'GENERATING' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <h3 className="font-semibold text-gray-900 mb-1">
            AI is generating your campaign assets...
          </h3>
          <p className="text-sm text-gray-600">
            This typically takes 30-60 seconds. This page will update
            automatically.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(
            [
              { id: 'all', label: 'All Assets', count: assetCounts.all },
              { id: 'social', label: 'Social Posts', count: assetCounts.social },
              { id: 'email', label: 'Email', count: assetCounts.email },
              { id: 'pages', label: 'Pages', count: assetCounts.pages },
            ] as Array<{ id: AssetTab; label: string; count: number }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(
                      asset.type
                    )}`}
                  >
                    {asset.type.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-700">
                    <span>{getPlatformIcon(asset.platform)}</span>
                    {asset.platform ?? 'N/A'}
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
                {asset.status === 'SCHEDULED' ? (
                  <span className="text-green-600 font-medium">✓ Scheduled</span>
                ) : (
                  <span className="text-gray-600 capitalize">
                    {asset.status.toLowerCase()}
                  </span>
                )}
              </div>

              {/* Performance */}
              {renderPerformanceMetrics(asset)}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(asset.content)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  <FiCopy />
                  Copy
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/marketing/schedule?asset=${asset.id}${
                        asset.platform ? `&platform=${asset.platform}` : ''
                      }`
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  <FiCalendar />
                  Schedule
                </button>
                <button
                  onClick={() => setEditingAsset(asset)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <FiEdit2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Asset Modal */}
      {(showAddAssetModal || editingAsset) && (
        <AssetModal
          campaignId={campaignId!}
          asset={editingAsset}
          onClose={() => {
            setShowAddAssetModal(false);
            setEditingAsset(null);
          }}
          onSave={async () => {
            await fetchCampaign();
            setShowAddAssetModal(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}

// Asset Modal Component
function AssetModal({
  campaignId,
  asset,
  onClose,
  onSave,
}: {
  campaignId: string;
  asset?: CampaignAsset | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: (asset?.type || 'SOCIAL_POST') as CampaignAsset['type'],
    platform: asset?.platform || null,
    content: asset?.content || '',
    mediaUrl: asset?.mediaUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setLoading(true);
    try {
      const url = asset
        ? `/api/campaigns/${campaignId}/assets/${asset.id}`
        : `/api/campaigns/${campaignId}/assets`;

      const method = asset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          type: formData.type,
          platform: formData.platform,
          content: formData.content,
          mediaUrl: formData.mediaUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save asset');
      }

      toast.success(asset ? 'Asset updated successfully' : 'Asset created successfully');
      onSave();
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast.error(error.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset || !user?.id) return;

    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/assets/${asset.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      toast.success('Asset deleted successfully');
      onSave();
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast.error(error.message || 'Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {asset ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as CampaignAsset['type'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="SOCIAL_POST">Social Post</option>
              <option value="EMAIL">Email</option>
              <option value="PAGE_VARIANT">Page Variant</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO_CLIP">Video Clip</option>
            </select>
          </div>

          {/* Platform (only for social posts) */}
          {formData.type === 'SOCIAL_POST' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={formData.platform || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    platform: (e.target.value || null) as CampaignAsset['platform'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Platform</option>
                <option value="TWITTER">Twitter</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="TIKTOK">TikTok</option>
              </select>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={8}
              placeholder="Enter your content here..."
              required
            />
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media URL (optional)
            </label>
            <input
              type="url"
              value={formData.mediaUrl}
              onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {asset && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : asset ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
