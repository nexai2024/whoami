'use client';

/**
 * Scheduler Dashboard Component
 * Main interface for managing scheduled posts
 */

import { useState, useEffect } from 'react';
import { Platform, PostType, ScheduleStatus } from '@prisma/client';
import toast from 'react-hot-toast';

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
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Form state for schedule modal
  const [formData, setFormData] = useState({
    content: '',
    platform: '',
    postType: '',
    date: '',
    time: '',
    mediaUrls: '',
    autoPost: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk schedule form state
  const [bulkFormData, setBulkFormData] = useState({
    postText: '',
    platform: 'TWITTER',
    postType: 'TWEET',
    strategy: 'OPTIMAL' as 'OPTIMAL' | 'EVENLY' | 'MANUAL',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    autoPost: false,
    minHoursBetween: 4
  });

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
        toast.error(error.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    }
  };

  const handleAnalyzeEngagement = async () => {
    setAnalyzing(true);
    setShowAnalyzeModal(false);

    try {
      const response = await fetch('/api/schedule/analyze', {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        toast.success('Analyzing engagement patterns...');
        
        // Poll for results every 5 seconds for 2 minutes
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes / 5 seconds
        
        const pollInterval = setInterval(async () => {
          attempts++;
          await fetchOptimalTimes();
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setAnalyzing(false);
            toast.success('Analysis complete!');
          }
        }, 5000);
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setAnalyzing(false);
        }, 120000);
      } else {
        const error = await response.json();
        if (error.error?.includes('Insufficient data')) {
          toast.error('Need at least 30 clicks to analyze. Keep growing your audience!');
        } else {
          toast.error(error.error || 'Analysis failed. Please try again later.');
        }
        setAnalyzing(false);
      }
    } catch (error) {
      console.error('Error analyzing engagement:', error);
      toast.error('Analysis failed. Please try again later.');
      setAnalyzing(false);
    }
  };

  const handleBulkSchedule = async () => {
    // Validate bulk form
    const lines = bulkFormData.postText.split('\n').filter(line => line.trim().length >= 10);
    
    if (lines.length < 2) {
      toast.error('Please enter at least 2 posts');
      return;
    }
    
    if (lines.length > 20) {
      toast.error('Maximum 20 posts allowed');
      return;
    }

    try {
      const posts = lines.map(content => ({
        content: content.trim(),
        platform: bulkFormData.platform,
        postType: bulkFormData.postType
      }));

      const config = {
        spread: bulkFormData.strategy,
        startDate: bulkFormData.startDate,
        endDate: bulkFormData.endDate,
        autoPost: bulkFormData.autoPost,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        minHoursBetween: bulkFormData.minHoursBetween
      };

      const response = await fetch('/api/schedule/bulk', {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ posts, config })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Scheduled ${data.summary.total} posts!`);
        setShowBulkScheduleModal(false);
        setBulkFormData({
          postText: '',
          platform: 'TWITTER',
          postType: 'TWEET',
          strategy: 'OPTIMAL',
          startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          autoPost: false,
          minHoursBetween: 4
        });
        await fetchScheduledPosts();
        setActiveTab('calendar');
      } else {
        const error = await response.json();
        if (error.error?.includes('No posts provided')) {
          toast.error('Please enter at least 2 posts');
        } else if (error.error?.includes('Insufficient optimal times')) {
          toast.error('Run engagement analysis first, or use Evenly Spaced mode');
        } else {
          toast.error(error.error || 'Failed to schedule posts');
        }
      }
    } catch (error) {
      console.error('Error bulk scheduling:', error);
      toast.error('Failed to schedule posts. Please try again.');
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

  const resetForm = () => {
    setFormData({
      content: '',
      platform: '',
      postType: '',
      date: '',
      time: '',
      mediaUrls: '',
      autoPost: false
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.content || formData.content.trim().length < 10) {
      errors.content = formData.content ? 'Content must be at least 10 characters' : 'Post content is required';
    }

    if (formData.content.length > 2000) {
      errors.content = 'Content must be less than 2000 characters';
    }

    if (!formData.platform) {
      errors.platform = 'Please select a platform';
    }

    if (!formData.postType) {
      errors.postType = 'Please select a post type';
    }

    if (!formData.date) {
      errors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      errors.time = 'Please select a time';
    } else if (formData.date) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
      if (selectedDateTime < fiveMinutesFromNow) {
        errors.time = 'Time must be at least 5 minutes from now';
      }
    }

    if (formData.mediaUrls) {
      const urls = formData.mediaUrls.split(',').map(u => u.trim()).filter(Boolean);
      for (const url of urls) {
        try {
          new URL(url);
        } catch {
          errors.mediaUrls = `Invalid URL format: ${url}`;
          break;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmitPost = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledFor = new Date(`${formData.date}T${formData.time}`).toISOString();
      const mediaUrlsArray = formData.mediaUrls
        ? formData.mediaUrls.split(',').map(u => u.trim()).filter(Boolean)
        : [];

      const payload = {
        content: formData.content,
        platform: formData.platform,
        postType: formData.postType,
        scheduledFor,
        mediaUrls: mediaUrlsArray,
        autoPost: formData.autoPost,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      await handleSchedulePost(payload);
      toast.success('Post scheduled successfully!');
      resetForm();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPostTypesByPlatform = (platform: string): string[] => {
    const types: Record<string, string[]> = {
      TWITTER: ['TWEET', 'THREAD'],
      INSTAGRAM: ['FEED_POST', 'STORY', 'REEL'],
      FACEBOOK: ['FACEBOOK_POST'],
      LINKEDIN: ['LINKEDIN_POST'],
      TIKTOK: ['FEED_POST'],
      EMAIL: ['EMAIL'],
      LINK_IN_BIO: ['FEED_POST']
    };
    return types[platform] || [];
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
      <div className="mb-8" data-tour-id="scheduler-header">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Scheduler
        </h1>
        <p className="text-gray-600">
          Schedule and manage your social media posts with AI-optimized timing
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6" data-tour-id="scheduler-tabs">
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkScheduleModal(true)}
                className="bg-white border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium"
              >
                📅 Bulk Schedule
              </button>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                data-tour-id="schedule-post-button"
              >
                + Schedule New Post
              </button>
            </div>
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
                  data-tour-id="post-card"
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
                          data-tour-id="post-status"
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
        <div data-tour-id="optimal-times-tab">
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
                data-tour-id="optimal-time-card"
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
                  <div className="flex items-center justify-between text-sm" data-tour-id="engagement-rate">
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
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAnalyzeModal(true)}
                disabled={analyzing}
                className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 font-medium disabled:opacity-50"
              >
                🔍 {analyzing ? 'Analyzing...' : 'Analyze My Data'}
              </button>
              <button
                onClick={fetchOptimalTimes}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ↻ Refresh Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Post history coming soon</p>
        </div>
      )}

      {/* Schedule New Post Modal */}
      {showNewPostModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
              setShowNewPostModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule New Post
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowNewPostModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="What do you want to post?"
                    value={formData.content}
                    maxLength={2000}
                    onChange={(e) => {
                      setFormData({ ...formData, content: e.target.value });
                      setFormErrors({ ...formErrors, content: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      formErrors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {formData.content.length} / 2000 characters
                    </span>
                    {formErrors.content && (
                      <p className="text-red-500 text-sm">{formErrors.content}</p>
                    )}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => {
                      setFormData({ ...formData, platform: e.target.value, postType: '' });
                      setFormErrors({ ...formErrors, platform: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.platform ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Choose platform...</option>
                    <option value="TWITTER">𝕏 (Twitter)</option>
                    <option value="INSTAGRAM">📷 Instagram</option>
                    <option value="FACEBOOK">👍 Facebook</option>
                    <option value="LINKEDIN">💼 LinkedIn</option>
                    <option value="TIKTOK">🎵 TikTok</option>
                    <option value="EMAIL">📧 Email</option>
                    <option value="LINK_IN_BIO">🔗 Link in Bio</option>
                  </select>
                  {formErrors.platform && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.platform}</p>
                  )}
                </div>

                {/* Post Type */}
                {formData.platform && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Type *
                    </label>
                    <select
                      value={formData.postType}
                      onChange={(e) => {
                        setFormData({ ...formData, postType: e.target.value });
                        setFormErrors({ ...formErrors, postType: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.postType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose type...</option>
                      {getPostTypesByPlatform(formData.platform).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    {formErrors.postType && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.postType}</p>
                    )}
                  </div>
                )}

                {/* Scheduled Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setFormErrors({ ...formErrors, date: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.date && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => {
                        setFormData({ ...formData, time: e.target.value });
                        setFormErrors({ ...formErrors, time: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.time && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
                    )}
                  </div>
                </div>

                {/* Media URLs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media URLs (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter comma-separated image/video URLs"
                    value={formData.mediaUrls}
                    onChange={(e) => {
                      setFormData({ ...formData, mediaUrls: e.target.value });
                      setFormErrors({ ...formErrors, mediaUrls: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.mediaUrls ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.mediaUrls && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.mediaUrls}</p>
                  )}
                </div>

                {/* Auto-post */}
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoPost"
                      checked={formData.autoPost}
                      onChange={(e) => setFormData({ ...formData, autoPost: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autoPost" className="text-sm font-medium text-gray-700">
                      Automatically publish (requires platform connection)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Note: Platform must be connected in settings to auto-post
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setShowNewPostModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPost}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Engagement Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analyze Engagement Patterns
            </h2>
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                We'll analyze your link-in-bio traffic from the past 90 days to find when your audience is most engaged
              </p>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Minimum 30 clicks required</span>
                </div>
                <div className="text-sm text-gray-600">
                  Current data: Analyzing available traffic data
                </div>
              </div>
              <p className="text-sm text-gray-600">
                ⏱️ This analysis takes 1-2 minutes
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This will replace your current optimal time slots
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAnalyzeModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzeEngagement}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Schedule Modal */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bulk Schedule Posts</h2>
                  <p className="text-sm text-gray-600 mt-1">Schedule multiple posts with smart timing</p>
                </div>
                <button
                  onClick={() => setShowBulkScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                {/* Posts Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posts to Schedule (one per line) *
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Enter each post on a new line...&#10;&#10;Example:&#10;Check out our new product! 🚀&#10;Behind the scenes look at our process&#10;Customer success story from this week"
                    value={bulkFormData.postText}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, postText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>
                      {bulkFormData.postText.split('\n').filter(line => line.trim().length >= 10).length} posts • 
                      {bulkFormData.postText.length} characters
                    </span>
                    <span>Min 2 posts, max 20 posts • Min 10 chars per post</span>
                  </div>
                </div>

                {/* Platform and Post Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform *
                    </label>
                    <select
                      value={bulkFormData.platform}
                      onChange={(e) => setBulkFormData({ 
                        ...bulkFormData, 
                        platform: e.target.value,
                        postType: getPostTypesByPlatform(e.target.value)[0] || ''
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="TWITTER">𝕏 (Twitter)</option>
                      <option value="INSTAGRAM">📷 Instagram</option>
                      <option value="FACEBOOK">👍 Facebook</option>
                      <option value="LINKEDIN">💼 LinkedIn</option>
                      <option value="TIKTOK">🎵 TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Type *
                    </label>
                    <select
                      value={bulkFormData.postType}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, postType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getPostTypesByPlatform(bulkFormData.platform).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timing Strategy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Timing Strategy *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
                      <input
                        type="radio"
                        name="strategy"
                        value="OPTIMAL"
                        checked={bulkFormData.strategy === 'OPTIMAL'}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, strategy: 'OPTIMAL' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Optimal Times</div>
                        <div className="text-sm text-gray-600">Use AI-optimized times based on your audience engagement</div>
                        {optimalTimes.length < 3 && (
                          <div className="text-xs text-yellow-600 mt-1">⚠️ Run engagement analysis first for best results</div>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
                      <input
                        type="radio"
                        name="strategy"
                        value="EVENLY"
                        checked={bulkFormData.strategy === 'EVENLY'}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, strategy: 'EVENLY' })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Evenly Spaced</div>
                        <div className="text-sm text-gray-600 mb-2">Spread posts evenly over time</div>
                        {bulkFormData.strategy === 'EVENLY' && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={bulkFormData.startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={bulkFormData.endDate}
                                min={bulkFormData.startDate}
                                onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Hours Between Posts
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={bulkFormData.minHoursBetween}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, minHoursBetween: parseInt(e.target.value) || 4 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkFormData.autoPost}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, autoPost: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Automatically publish</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBulkScheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSchedule}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Schedule All Posts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}