'use client';

/**
 * Repurpose Results Component
 * Display repurposed content with generated assets
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCopy, FiCalendar, FiEdit2, FiDownload, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RepurposedAsset {
  id: string;
  platform: string;
  type: string;
  content: string;
  metadata?: Record<string, string>;
}

interface RepurposedContent {
  id: string;
  sourceUrl: string;
  sourceType: string;
  title: string;
  summary: string;
  keyPoints: string[];
  status: 'ANALYZING' | 'EXTRACTING' | 'GENERATING' | 'READY' | 'FAILED';
  createdAt: string;
  assets: RepurposedAsset[];
}

export default function RepurposeResults() {
  const params = useParams();
  const router = useRouter();
  const contentId = params?.id as string;

  const [content, setContent] = useState<RepurposedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'social' | 'email' | 'longform'>('all');
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  useEffect(() => {
    const needsPolling = content?.status && ['ANALYZING', 'EXTRACTING', 'GENERATING'].includes(content.status);

    if (needsPolling && !polling) {
      setPolling(true);
      const interval = setInterval(() => {
        fetchContent(true);
      }, 3000);

      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }
  }, [content?.status, polling]);

  const fetchContent = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/repurpose/${contentId}`);
      const data = await response.json();
      setContent(data.repurposed);
    } catch (error) {
      console.error('Error fetching repurposed content:', error);
      toast.error('Failed to load content');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const exportAllAssets = () => {
    if (!content) return;

    const exportData = content.assets.map(asset => ({
      platform: asset.platform,
      type: asset.type,
      content: asset.content,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurposed-content-${content.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Assets exported!');
  };

  const filteredAssets = content?.assets.filter((asset) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'social') return ['TWITTER_THREAD', 'INSTAGRAM_CAPTION', 'LINKEDIN_POST', 'FACEBOOK_POST'].includes(asset.type);
    if (activeTab === 'email') return asset.type.includes('EMAIL');
    if (activeTab === 'longform') return ['BLOG_POST', 'ARTICLE'].includes(asset.type);
    return true;
  }) || [];

  const assetCounts = {
    all: content?.assets.length || 0,
    social: content?.assets.filter((a) => ['TWITTER_THREAD', 'INSTAGRAM_CAPTION', 'LINKEDIN_POST', 'FACEBOOK_POST'].includes(a.type)).length || 0,
    email: content?.assets.filter((a) => a.type.includes('EMAIL')).length || 0,
    longform: content?.assets.filter((a) => ['BLOG_POST', 'ARTICLE'].includes(a.type)).length || 0,
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

  if (!content) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Content not found</h2>
        <button
          onClick={() => router.push('/marketing/repurpose')}
          className="text-purple-600 hover:text-purple-700"
        >
          ← Back to Repurpose Studio
        </button>
      </div>
    );
  }

  const isProcessing = ['ANALYZING', 'EXTRACTING', 'GENERATING'].includes(content.status);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/marketing/repurpose')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft />
          <span className="text-sm">Back to Repurpose Studio</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              {content.sourceType}
            </span>
            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              content.status === 'READY' ? 'bg-green-100 text-green-800' :
              isProcessing ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {content.status}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {content.summary && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              AI-Generated Summary:
            </h3>
            <p className="text-sm text-gray-900">{content.summary}</p>
          </div>
        )}

        {/* Key Points */}
        {content.keyPoints && content.keyPoints.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Key Points Extracted:
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.keyPoints.map((point, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {content.status === 'ANALYZING' && 'Analyzing source...'}
            {content.status === 'EXTRACTING' && 'Extracting key points...'}
            {content.status === 'GENERATING' && 'Generating platform content...'}
          </h3>
          <p className="text-sm text-gray-600">This page will update automatically.</p>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Generated Assets ({content.assets.length})
        </h2>
        <div className="flex gap-3">
          <button
            onClick={exportAllAssets}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            <FiDownload />
            Export All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All', count: assetCounts.all },
            { id: 'social', label: 'Social', count: assetCounts.social },
            { id: 'email', label: 'Email', count: assetCounts.email },
            { id: 'longform', label: 'Long-form', count: assetCounts.longform },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'social' | 'email' | 'longform')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {isProcessing ? 'Assets are being generated...' : 'No assets in this category'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-5"
            >
              {/* Asset Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {asset.platform} - {asset.type.replace(/_/g, ' ')}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(asset.content)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Copy"
                  >
                    <FiCopy />
                  </button>
                  <button
                    onClick={() => router.push(`/marketing/schedule?asset=${asset.id}`)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Schedule"
                  >
                    <FiCalendar />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </div>

              {/* Content Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {asset.content}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>{asset.content.split(/\s+/).length} words</span>
                <span>•</span>
                <span>{asset.content.length} characters</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
