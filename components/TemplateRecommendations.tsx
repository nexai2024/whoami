"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

const {
  FiZap,
  FiTrendingUp,
  FiStar,
  FiEye,
  FiDownload,
  FiRefreshCw
} = FiIcons;

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  tags: string[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  thumbnailUrl: string;
  useCount: number;
  rating?: number;
  featured: boolean;
  createdAt: string;
  reason?: string;
}

interface TemplateRecommendationsProps {
  pageId?: string;
  userId?: string;
  onApply?: (templateId: string) => void;
}

const TemplateRecommendations: React.FC<TemplateRecommendationsProps> = ({
  pageId,
  userId,
  onApply
}) => {
  const [recommendations, setRecommendations] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [pageId, userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (pageId) params.append('pageId', pageId);

      const response = await fetch(`/api/templates/pages/recommend?${params}`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setInsights(data.insights);
      } else {
        toast.error('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (template: Template) => {
    if (!pageId) {
      toast.error('No page selected');
      return;
    }

    if (!confirm(`Apply "${template.name}" template?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/pages/${template.id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'demo-user'
        },
        body: JSON.stringify({ pageId })
      });

      if (response.ok) {
        toast.success('Template applied successfully!');
        if (onApply) {
          onApply(template.id);
        }
        window.location.reload();
      } else {
        toast.error('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center py-12">
        <FiZap className="text-gray-400 text-5xl mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
        <p className="text-gray-600">Complete your profile to get personalized template suggestions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiZap className="text-indigo-600" />
            AI-Powered Recommendations
          </h2>
          {insights && (
            <p className="text-sm text-gray-600 mt-1">
              Based on your {insights.userType} profile{insights.industry && ` in ${insights.industry}`}
            </p>
          )}
        </div>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiRefreshCw className="text-lg" />
          Refresh
        </button>
      </div>

      {/* Insights Badge */}
      {insights && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-indigo-600" />
            <span className="font-medium text-indigo-900">Recommended Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.recommendedCategories?.map((cat: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                width={1200}
                height={675}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {template.featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <FiStar className="text-sm" />
                  Featured
                </div>
              )}
              {template.reason && (
                <div className="absolute bottom-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {template.reason}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {template.category}
                </span>
                {template.industry && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                    {template.industry}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <FiTrendingUp />
                  <span>{template.useCount} uses</span>
                </div>
                {template.rating !== undefined && template.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-500 fill-yellow-500" />
                    <span>{template.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`/templates/${template.id}/preview${pageId ? `?pageId=${pageId}` : ''}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiEye />
                  Preview
                </a>
                {pageId && (
                  <button
                    onClick={() => handleApply(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiDownload />
                    Use
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TemplateRecommendations;

