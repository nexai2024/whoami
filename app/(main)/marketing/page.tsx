'use client';
import Link from 'next/link';
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
        <Link
          href="/marketing/campaigns"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Campaign Generator</h2>
          
            Generate multi-channel marketing campaigns with AI. Create social posts, emails, and landing page variants in minutes.
          
        </Link>

        <Link
          href="/marketing/repurpose"
          className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Repurpose Studio</h2>
          
            Transform any content into platform-specific posts. Extract key points from videos, blogs, podcasts, and more.
          
        </Link>

        <Link
          href="/marketing/lead-magnets"
          className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Lead Magnets</h2>
            Create irresistible content upgrades. Build your email list with PDFs, ebooks, templates, and video courses.
        </Link>

        <Link
          href="/marketing/products"
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Products</h2>
            Manage digital products and track sales. Create products with Stripe integration for payment processing.
        </Link>

        <Link
          href="/marketing/schedule"
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Smart Scheduler</h2>
            Schedule posts across all platforms. AI-powered optimal posting times for maximum engagement.
        </Link>
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
