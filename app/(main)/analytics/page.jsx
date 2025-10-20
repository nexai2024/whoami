'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Analytics from '@/components/Analytics';
import { PageService } from '@/lib/database/pages';
import { AnalyticsService } from '@/lib/database/analytics';
import { useAuth } from '@/lib/auth/AuthContext.jsx';
import { logger } from '@/lib/utils/logger';

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const pageIdParam = searchParams.get('page'); // Gets ?page=xxx
  const { currUser } = useAuth();

  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(pageIdParam || 'all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currUser) {
      loadPages();
    }
  }, [currUser]);

  useEffect(() => {
    if (currUser && selectedPageId) {
      loadAnalytics(selectedPageId);
    }
  }, [selectedPageId, currUser]);

  useEffect(() => {
    if (pageIdParam && pageIdParam !== selectedPageId) {
      setSelectedPageId(pageIdParam);
    }
  }, [pageIdParam]);

  const loadPages = async () => {
    try {
      const userPages = await PageService.getUserPages(currUser.id);
      setPages(userPages);
    } catch (error) {
      logger.error('Error loading pages:', error);
    }
  };

  const loadAnalytics = async (pageId) => {
    try {
      setLoading(true);
      let data;
      if (pageId === 'all') {
        // Fetch combined analytics for all pages
        data = await AnalyticsService.getUserAnalytics(currUser.id, 30);
      } else {
        // Fetch analytics for specific page
        data = await AnalyticsService.getPageAnalytics(pageId, 30);
      }
      setAnalyticsData(data);
    } catch (error) {
      logger.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPageId) => {
    setSelectedPageId(newPageId);
    // Update URL without full page reload
    const url = new URL(window.location);
    if (newPageId === 'all') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', newPageId);
    }
    window.history.pushState({}, '', url);
  };

  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <Analytics
      data={analyticsData}
      pages={pages}
      selectedPageId={selectedPageId}
      onPageChange={handlePageChange}
      loading={loading}
    />
  );
}
