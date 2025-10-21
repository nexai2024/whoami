'use client';

/**
 * Marketing Hub Dashboard Overview
 * Main landing page for the marketing hub
 */

export default function MarketingDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Marketing Hub
        </h1>
        <p className="text-gray-600">
          Powerful tools to grow your content and course business
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/marketing/campaigns"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Campaign Generator</h2>
          <p className="text-blue-100">
            Generate multi-channel marketing campaigns with AI. Create social posts, emails, and landing page variants in minutes.
          </p>
        </a>

        <a
          href="/marketing/repurpose"
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Repurpose Studio</h2>
          <p className="text-purple-100">
            Transform any content into platform-specific posts. Extract key points from videos, blogs, podcasts, and more.
          </p>
        </a>

        <a
          href="/marketing/lead-magnets"
          className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Lead Magnets</h2>
          <p className="text-green-100">
            Create irresistible content upgrades. Build your email list with PDFs, ebooks, templates, and video courses.
          </p>
        </a>

        <a
          href="/marketing/schedule"
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Smart Scheduler</h2>
          <p className="text-orange-100">
            Schedule posts across all platforms. AI-powered optimal posting times for maximum engagement.
          </p>
        </a>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
          <div className="text-sm text-gray-600">Campaigns Created</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
          <div className="text-sm text-gray-600">Content Repurposed</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-1">0</div>
          <div className="text-sm text-gray-600">Lead Magnets</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
          <div className="text-sm text-gray-600">Scheduled Posts</div>
        </div>
      </div>
    </div>
  );
}
