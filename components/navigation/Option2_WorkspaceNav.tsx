'use client';

/**
 * Option 2: Workspace-Based Navigation
 * Notion/Figma-style navigation with workspace switcher and contextual navigation
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  FiHome, FiFileText, FiBook, FiGift, FiShoppingBag,
  FiTrendingUp, FiBarChart2, FiSettings, FiCreditCard,
  FiUser, FiLogOut, FiChevronDown, FiChevronRight,
  FiZap, FiMail, FiCalendar, FiUsers, FiLayers,
  FiActivity, FiPlus, FiArrowUpRight
} from 'react-icons/fi';
import Logo from '../Logo';

interface RecentItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  timestamp: string;
}

interface NavSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  links: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: string;
  }>;
}

export default function WorkspaceNav() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['create', 'manage']);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Determine current section based on pathname
  const getCurrentSection = (): string => {
    if (pathname?.startsWith('/dashboard') || pathname === '/') return 'create';
    if (pathname?.startsWith('/courses') || pathname?.startsWith('/my-courses')) return 'manage';
    if (pathname?.startsWith('/marketing')) return 'grow';
    if (pathname?.startsWith('/analytics')) return 'analyze';
    if (pathname?.startsWith('/settings') || pathname?.startsWith('/profile')) return 'settings';
    return 'create';
  };

  const currentSection = getCurrentSection();

  // Navigation sections
  const sections: NavSection[] = [
    {
      id: 'create',
      name: 'Create',
      icon: FiPlus,
      links: [
        { name: 'Pages', href: '/dashboard', icon: FiFileText, badge: 'Hot' },
        { name: 'Courses', href: '/courses?new=true', icon: FiBook, badge: 'Hot' },
        { name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift, badge: 'Hot' },
        { name: 'Products', href: '/marketing/products', icon: FiShoppingBag },
        { name: 'Funnels', href: '/funnels?new=true', icon: FiTrendingUp },
      ]
    },
    {
      id: 'manage',
      name: 'Manage',
      icon: FiLayers,
      links: [
        { name: 'All Pages', href: '/dashboard', icon: FiFileText },
        { name: 'My Courses', href: '/my-courses', icon: FiBook },
        { name: 'Workflows', href: '/workflows', icon: FiZap },
        { name: 'Campaigns', href: '/marketing/campaigns', icon: FiMail },
        { name: 'Bookings', href: '/coach/bookings', icon: FiCalendar, badge: 'Coach' },
      ]
    },
    {
      id: 'grow',
      name: 'Grow',
      icon: FiTrendingUp,
      links: [
        { name: 'Leads', href: '/leads', icon: FiUsers, badge: 'Hot' },
        { name: 'Marketing Hub', href: '/marketing', icon: FiTrendingUp },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
      ]
    },
    {
      id: 'analyze',
      name: 'Analyze',
      icon: FiActivity,
      links: [
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
        { name: 'Campaign Analytics', href: '/marketing/analytics', icon: FiBarChart2 },
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: FiSettings,
      links: [
        { name: 'Account', href: '/settings', icon: FiSettings },
        { name: 'Billing', href: '/settings/billing', icon: FiCreditCard },
        { name: 'Profile', href: '/profile', icon: FiUser },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Logo />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">My Workspace</div>
                <div className="text-xs text-gray-500">Free Plan</div>
              </div>
            </div>
            <FiChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* User Area - Always Visible */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {user?.displayName || 'User'}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user?.primaryEmail}
              </div>
            </div>
          </div>
          
          {/* Plan Badge with Upgrade CTA */}
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">Current Plan</div>
              <div className="text-sm font-semibold text-gray-900">Free</div>
            </div>
            <Link
              href="/settings/billing"
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-xs font-medium"
            >
              Upgrade
              <FiArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg transition-all ${
              pathname === '/dashboard'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiHome size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Sections */}
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const isActive = currentSection === section.id;

            return (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="font-medium text-sm">{section.name}</span>
                  </div>
                  <FiChevronRight
                    size={14}
                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {section.links.map((link) => {
                      const LinkIcon = link.icon;
                      const active = isLinkActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            active
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <LinkIcon size={16} />
                          <span className="flex-1">{link.name}</span>
                          {link.badge && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              link.badge === 'Hot'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <div className="p-3 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              Recent
            </div>
            <div className="space-y-1">
              {recentItems.slice(0, 3).map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    <ItemIcon size={16} />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.timestamp}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
          >
            <FiSettings size={18} />
            <span className="flex-1 text-left">More Settings</span>
            <FiChevronDown size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Content will be rendered here */}
      </main>
    </div>
  );
}

