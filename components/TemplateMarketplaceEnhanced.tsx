"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

const {
  FiStar,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiHeart,
  FiMessageCircle
} = FiIcons;

interface TemplateMarketplaceEnhancedProps {
  userId?: string;
  onPurchase?: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  thumbnailUrl: string;
  price?: number;
  currency?: string;
  isPaid: boolean;
  licenseType: string;
  rating?: number;
  reviewCount?: number;
  totalSales: number;
  totalRevenue: number;
  creator?: {
    displayName: string;
    avatarUrl?: string;
    verified: boolean;
  };
}

const TemplateMarketplaceEnhanced: React.FC<TemplateMarketplaceEnhancedProps> = ({
  userId,
  onPurchase
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price' | 'rating'>('popular');

  useEffect(() => {
    fetchTemplates();
  }, [filter, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        marketplace: 'true',
        filter,
        sortBy
      });

      const response = await fetch(`/api/templates/pages/marketplace?${params}`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (template: Template) => {
    if (!userId) {
      toast.error('Please sign in to purchase templates');
      return;
    }

    if (!template.isPaid || !template.price) {
      toast.error('This template is free');
      return;
    }

    try {
      const response = await fetch(`/api/templates/${template.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          templateId: template.id
        })
      });

      if (response.ok) {
        toast.success('Template purchased successfully!');
        if (onPurchase) {
          onPurchase(template.id);
        }
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to purchase template');
      }
    } catch (error) {
      console.error('Error purchasing template:', error);
      toast.error('Failed to purchase template');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Marketplace</h2>
          <p className="text-gray-600 mt-1">Browse and purchase professional templates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'free', 'paid', 'premium'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded text-sm ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price">Price</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              {template.isPaid && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">
                  ${template.price}
                </div>
              )}
              {template.licenseType === 'premium' && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <FiAward />
                  Premium
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {template.rating !== undefined && template.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-500 fill-yellow-500 text-sm" />
                    <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Creator */}
              {template.creator && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    {template.creator.avatarUrl ? (
                      <Image
                        src={template.creator.avatarUrl}
                        alt={template.creator.displayName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-600">
                        {template.creator.displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{template.creator.displayName}</span>
                  {template.creator.verified && (
                    <FiCheckCircle className="text-blue-600 text-xs" />
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <FiTrendingUp />
                  <span>{template.totalSales} sales</span>
                </div>
                {template.reviewCount !== undefined && template.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <FiMessageCircle />
                    <span>{template.reviewCount} reviews</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`/templates/${template.id}/preview`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Preview
                </a>
                {template.isPaid ? (
                  <button
                    onClick={() => handlePurchase(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <FiShoppingBag />
                    Buy ${template.price}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      toast.success('Free template - you can use it directly!');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FiCheckCircle />
                    Free
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FiShoppingBag className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default TemplateMarketplaceEnhanced;






