'use client';

/**
 * Scheduler Dashboard Component
 * Main interface for managing scheduled posts
 */

import { useState, useEffect } from 'react';
import { Platform, PostType, ScheduleStatus } from '@prisma/client';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  platform: Platform;
  postType: PostType;
  scheduledFor: string;
  status: ScheduleStatus;
  autoPost: boolean;
  publishedAt: string | null;
  externalUrl: string | null;
  performance: {
    views: number | null;
    clicks: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
  };
}

interface OptimalTime {
  datetime: string;
  dayOfWeek: string;
  hourOfDay: number;
  platform: string;
  engagementRate: number | null;
  confidence: number;
  rank: number | null;
  reason: string;
}

export default function SchedulerDashboard() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'optimal' | 'history'>('calendar');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Fetch scheduled posts
  useEffect(() => {
    fetchScheduledPosts();
    fetchOptimalTimes();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/schedule/posts?status=PENDING&status=PROCESSING');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimalTimes = async () => {
    try {
      const response = await fetch('/api/schedule/optimal-times?count=10');
      const data = await response.json();
      setOptimalTimes(data.optimalTimes || data.defaultTimes || []);
    } catch (error) {
      console.error('Error fetching optimal times:', error);
    }
  };

  const handleSchedulePost = async (postData: any) => {
    try {
      const response = await fetch('/api/schedule/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        fetchScheduledPosts(); // Refresh list
        setShowNewPostModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('Failed to schedule post');
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    const icons: Record<Platform, string> = {
      TWITTER: '𝕏',
      INSTAGRAM: '📷',
      FACEBOOK: '👍',
      LINKEDIN: '💼',
      TIKTOK: '🎵',
      EMAIL: '📧',
      LINK_IN_BIO: '🔗',
    };
    return icons[platform] || '📱';
  };

  const getStatusColor = (status: ScheduleStatus) => {
    const colors: Record<ScheduleStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Scheduler
        </h1>
        <p className="text-gray-600">
          Schedule and manage your social media posts with AI-optimized timing
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'calendar', label: 'Calendar', count: posts.length },
            { id: 'optimal', label: 'Optimal Times', count: optimalTimes.length },
            { id: 'history', label: 'History', count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Scheduled Posts</h2>
              <p className="text-sm text-gray-600">
                {posts.length} posts scheduled
              </p>
            </div>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Schedule New Post
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No scheduled posts yet</p>
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Schedule your first post →
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {getPlatformIcon(post.platform)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {post.platform}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(post.scheduledFor).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      {post.mediaUrls.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                          {post.mediaUrls.slice(0, 3).map((url, index) => (
                            <div
                              key={index}
                              className="w-16 h-16 bg-gray-100 rounded overflow-hidden"
                            >
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {post.mediaUrls.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                              +{post.mediaUrls.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {post.status === 'PUBLISHED' && post.performance.views !== null && (
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>👁 {post.performance.views} views</span>
                          <span>💗 {post.performance.likes} likes</span>
                          <span>💬 {post.performance.comments} comments</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2">
                      {post.status === 'PENDING' && (
                        <>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel
                          </button>
                        </>
                      )}
                      {post.status === 'PUBLISHED' && post.externalUrl && (
                        <a
                          href={post.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Post →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Optimal Times Tab */}
      {activeTab === 'optimal' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Optimal Posting Times</h2>
            <p className="text-sm text-gray-600">
              Best times to post based on your audience engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {optimalTimes.map((time, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">
                      {time.platform !== 'ALL' && getPlatformIcon(time.platform as Platform)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {time.dayOfWeek}
                    </span>
                  </div>
                  {time.rank && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      #{time.rank}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {time.hourOfDay}:00
                  </p>
                  <p className="text-sm text-gray-600">{time.reason}</p>
                </div>

                {time.engagementRate !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium text-green-600">
                      {time.engagementRate.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence</span>
                    <span className="font-medium">{time.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${time.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={fetchOptimalTimes}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ↻ Refresh Analysis
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Post history coming soon</p>
        </div>
      )}
    </div>
  );
}
