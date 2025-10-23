'use client';

/**
 * Settings Dashboard Overview
 * Main settings page with navigation to settings sub-pages
 */

export default function SettingsDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/settings/billing"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white hover:shadow-xl transition-shadow group"
        >
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:underline">Billing & Subscription</h2>
          <p className="text-blue-100">
            Manage your subscription plan, view usage, and update billing information.
          </p>
        </a>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-8 text-white cursor-not-allowed opacity-60">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
          <p className="text-gray-100">
            Update your profile information and preferences.
          </p>
          <div className="mt-4 bg-white/20 rounded-lg px-3 py-1 inline-block text-sm">
            Coming Soon
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-8 text-white cursor-not-allowed opacity-60">
          <div className="text-5xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold mb-2">Integrations</h2>
          <p className="text-gray-100">
            Connect your social media accounts and third-party services.
          </p>
          <div className="mt-4 bg-white/20 rounded-lg px-3 py-1 inline-block text-sm">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
