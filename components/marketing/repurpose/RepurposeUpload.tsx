'use client';

/**
 * Repurpose Upload Component
 * Interface for submitting content URLs for repurposing
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RecentItem {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  _count: {
    assets: number;
  };
}

const platforms = [
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️' },
  { id: 'blog', name: 'Blog', icon: '📝' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'spotify', name: 'Spotify', icon: '🎧' },
  { id: 'twitter', name: 'Twitter', icon: '𝕏' },
];

export default function RepurposeUpload() {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentRepurposed();
  }, []);

  const fetchRecentRepurposed = async () => {
    try {
      const response = await fetch('/api/repurpose?limit=5');
      const data = await response.json();
      setRecentItems(data.repurposed || []);
    } catch (error) {
      console.error('Error fetching recent repurposed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sourceUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(sourceUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/repurpose/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze content');
      }

      toast.success('Content analysis started!');
      router.push(`/marketing/repurpose/${data.repurposed.id}`);
    } catch (err: any) {
      console.error('Error repurposing content:', err);
      setError(err.message || 'Failed to analyze content. Please try again.');
      toast.error(err.message || 'Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Content Repurposing Studio
        </h1>
        <p className="text-lg text-gray-600">
          Transform any content into platform-specific posts
        </p>
      </div>

      {/* Main Upload Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Paste Content URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <button
                type="submit"
                disabled={loading || !sourceUrl.trim()}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 ${
                  loading || !sourceUrl.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze & Repurpose
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              YouTube, TikTok, Instagram, Podcast, Blog, Spotify - we'll extract and repurpose
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Source Platform Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          OR SELECT SOURCE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => {
                // Focus input and show helper text
                const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                input?.focus();
                toast(`Paste a ${platform.name} URL above`, { icon: platform.icon });
              }}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-center group"
            >
              <div className="text-4xl mb-2">{platform.icon}</div>
              <div className="font-medium text-gray-900">{platform.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Repurposed Section */}
      {recentItems.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recently Repurposed
          </h2>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {item.sourceType}
                      </span>
                      <span>{item._count.assets} assets generated</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/marketing/repurpose/${item.id}`)}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
