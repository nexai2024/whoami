'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BlockRenderer from '@/components/BlockRenderer';

/**
 * Link-in-Bio Public Page
 * Renders a user's published page with header and blocks
 */

interface PageHeader {
  displayName: string;
  title: string;
  bio: string;
  avatar?: string;
  company?: string;
  location?: string;
  email?: string;
  socialLinks?: Array<{ platform: string; url: string; }>;
}

interface Block {
  id: string;
  type: string;
  title: string;
  url?: string;
  data?: any;
  position: number;
  isActive: boolean;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isActive: boolean;
  pageHeader: PageHeader;
  blocks: Block[];
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export default function SubdomainPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    if (subdomain) {
      loadPage();
    }
  }, [subdomain]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch page data by slug (subdomain acts as slug)
      const response = await fetch(`/api/pages?slug=${subdomain}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Page not found');
        } else {
          setError('Failed to load page');
        }
        return;
      }

      const data = await response.json();

      // Handle different response formats
      let pageData: PageData;
      if (Array.isArray(data.pages) && data.pages.length > 0) {
        pageData = data.pages[0];
      } else if (data.page) {
        pageData = data.page;
      } else {
        pageData = data;
      }

      if (!pageData.isActive) {
        setError('This page is not published');
        return;
      }

      setPage(pageData);

      // Record page view
      recordPageView(pageData.id);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const recordPageView = async (pageId: string) => {
    try {
      // Record analytics view
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          eventType: 'PAGE_VIEW',
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error recording page view:', err);
    }
  };

  const handleBlockClick = async (block: Block) => {
    if (!page) return;

    try {
      // Record block click
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page.id,
          blockId: block.id,
          eventType: 'BLOCK_CLICK',
          timestamp: new Date().toISOString()
        })
      });

      // Handle different block types
      if (block.type === 'link' && block.url) {
        window.open(block.url, '_blank', 'noopener,noreferrer');
      } else if (block.type === 'product') {
        window.open(`/checkout/${block.id}`, '_blank');
      }
    } catch (err) {
      console.error('Error handling block click:', err);
    }
  };

  const shareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareMenuOpen(false);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error === 'Page not found' ? 'Page Not Found' : 'Error Loading Page'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Page not found'
              ? "The page you're looking for doesn't exist."
              : error || 'Something went wrong loading this page.'}
          </p>
          <a
            href="/"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        backgroundColor: page.backgroundColor || '#f8fafc',
        color: page.textColor || '#1f2937',
        fontFamily: page.fontFamily || 'Inter, sans-serif'
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <motion.div
          className="text-center mb-8 p-6 bg-white rounded-2xl shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            {page.pageHeader?.avatar ? (
              <img
                src={page.pageHeader.avatar}
                alt={page.pageHeader.displayName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {page.pageHeader?.displayName?.charAt(0) || page.slug?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          {/* Display Name */}
          <h1 className="text-2xl font-bold mb-2">
            {page.pageHeader?.displayName || page.title || subdomain}
          </h1>

          {/* Title/Role */}
          {page.pageHeader?.title && (
            <p className="text-gray-700 font-medium mb-2">{page.pageHeader.title}</p>
          )}

          {/* Company */}
          {page.pageHeader?.company && (
            <p className="text-gray-600 text-sm mb-2">📍 {page.pageHeader.company}</p>
          )}

          {/* Location */}
          {page.pageHeader?.location && (
            <p className="text-gray-600 text-sm mb-2">🌍 {page.pageHeader.location}</p>
          )}

          {/* Bio */}
          {page.pageHeader?.bio && (
            <p className="text-gray-600 mb-4">{page.pageHeader.bio}</p>
          )}

          {/* Social Links & Share */}
          <div className="flex justify-center gap-4 flex-wrap">
            {/* Social Links */}
            {page.pageHeader?.socialLinks && page.pageHeader.socialLinks.length > 0 && (
              <div className="flex gap-2">
                {page.pageHeader.socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            )}

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                <span>🔗</span>
                Share
              </button>
              {shareMenuOpen && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-10">
                  <button
                    onClick={shareUrl}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-700 text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Blocks */}
        <div className="space-y-4">
          {page.blocks && page.blocks.length > 0 ? (
            page.blocks
              .filter(block => block.isActive)
              .sort((a, b) => a.position - b.position)
              .map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <BlockRenderer
                    block={block}
                    onBlockClick={handleBlockClick}
                  />
                </motion.div>
              ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">No content blocks yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-sm text-gray-500 mb-4">
            Made with WhoAmI
          </p>
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Create your own page →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
