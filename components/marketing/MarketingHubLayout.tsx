'use client';

/**
 * Marketing Hub Layout Component
 * Container layout with sidebar navigation for all marketing features
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiZap,
  FiGift,
  FiRefreshCw,
  FiCalendar,
  FiBarChart,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface MarketingHubLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof FiHome;
  route: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome, route: '/marketing' },
  { id: 'campaigns', label: 'Campaigns', icon: FiZap, route: '/marketing/campaigns' },
  { id: 'lead-magnets', label: 'Lead Magnets', icon: FiGift, route: '/marketing/lead-magnets' },
  { id: 'repurpose', label: 'Repurpose Studio', icon: FiRefreshCw, route: '/marketing/repurpose' },
  { id: 'schedule', label: 'Scheduler', icon: FiCalendar, route: '/marketing/schedule' },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart, route: '/marketing/analytics' },
];

export default function MarketingHubLayout({ children }: MarketingHubLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (route: string) => {
    if (route === '/marketing') {
      return pathname === '/marketing';
    }
    return pathname?.startsWith(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Marketing Hub</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-100 border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">Marketing Hub</h2>
            <p className="text-sm text-gray-600 mt-1">Grow your audience</p>
          </div>

          <nav className="flex-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.route);

              return (
                <Link
                  key={item.id}
                  href={item.route}
                  className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </aside>

        {/* Sidebar - Mobile (Overlay) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <aside
              className="w-64 bg-gray-100 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Marketing Hub</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Grow your audience</p>
              </div>

              <nav className="px-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.route);

                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-200 absolute bottom-0 left-0 right-0 bg-gray-100">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
