'use client';

/**
 * Option 3: Hub & Spoke Navigation
 * Card-based hub dashboard with contextual sidebars
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiFileText, FiBook, FiGift, FiShoppingBag,
  FiTrendingUp, FiBarChart2, FiSettings, FiCreditCard,
  FiUser, FiLogOut, FiChevronDown, FiSearch, FiBell,
  FiZap, FiMail, FiCalendar, FiUsers, FiLayers,
  FiActivity, FiPlus, FiX, FiArrowRight
} from 'react-icons/fi';
import Logo from '../Logo';

interface HubCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  gradient: string;
  badge?: string;
}

const hubCards: HubCard[] = [
  {
    id: 'create',
    title: 'Create',
    description: 'Build pages, courses, and content',
    href: '/dashboard',
    icon: FiPlus,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    badge: 'Hot'
  },
  {
    id: 'manage',
    title: 'Manage',
    description: 'Organize your content and workflows',
    href: '/my-courses',
    icon: FiLayers,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'grow',
    title: 'Grow',
    description: 'Marketing, leads, and growth tools',
    href: '/marketing',
    icon: FiTrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'analyze',
    title: 'Analyze',
    description: 'Analytics and performance insights',
    href: '/analytics',
    icon: FiActivity,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'courses',
    title: 'Courses',
    description: 'Create and manage courses',
    href: '/courses',
    icon: FiBook,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'workflows',
    title: 'Workflows',
    description: 'Automation and integrations',
    href: '/workflows',
    icon: FiZap,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'leads',
    title: 'Leads',
    description: 'View and manage your leads',
    href: '/leads',
    icon: FiUsers,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Account and preferences',
    href: '/settings',
    icon: FiSettings,
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
  },
];

export default function HubSpokeNav() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContextualSidebar, setShowContextualSidebar] = useState(false);

  // Determine if we're on hub (dashboard) or in a section
  const isOnHub = pathname === '/dashboard' || pathname === '/';
  const currentSection = hubCards.find(card => pathname?.startsWith(card.href));

  // Contextual sidebar items based on current section
  const getContextualSidebarItems = () => {
    if (!currentSection) return [];
    
    const sectionMap: Record<string, Array<{ name: string; href: string; icon: React.ComponentType<{ size?: number }> }>> = {
      create: [
        { name: 'Pages', href: '/dashboard', icon: FiFileText },
        { name: 'Courses', href: '/courses?new=true', icon: FiBook },
        { name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift },
        { name: 'Products', href: '/marketing/products', icon: FiShoppingBag },
      ],
      manage: [
        { name: 'All Pages', href: '/dashboard', icon: FiFileText },
        { name: 'My Courses', href: '/my-courses', icon: FiBook },
        { name: 'Workflows', href: '/workflows', icon: FiZap },
        { name: 'Campaigns', href: '/marketing/campaigns', icon: FiMail },
      ],
      grow: [
        { name: 'Leads', href: '/leads', icon: FiUsers },
        { name: 'Marketing Hub', href: '/marketing', icon: FiTrendingUp },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
      ],
    };

    return sectionMap[currentSection.id] || [];
  };

  const contextualItems = getContextualSidebarItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Back to Hub */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              whoami
            </span>
          </Link>
          {!isOnHub && (
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiHome size={16} />
              <span>Back to Hub</span>
            </Link>
          )}
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu Button */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {isOnHub ? (
          /* Hub Dashboard */
          <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.displayName || 'there'}!</h1>
              <p className="text-gray-600">Choose where you'd like to go</p>
            </div>

            {/* Hub Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hubCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={card.href}
                      className="block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-lg group"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                        {card.badge && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                      <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Go to {card.title}</span>
                        <FiArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Stats or Recent Activity */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Pages Created</div>
                <div className="text-3xl font-bold text-gray-900">12</div>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Leads</div>
                <div className="text-3xl font-bold text-gray-900">1,234</div>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Active Courses</div>
                <div className="text-3xl font-bold text-gray-900">5</div>
              </div>
            </div>
          </div>
        ) : (
          /* Section View with Contextual Sidebar */
          <div className="flex">
            {/* Contextual Sidebar */}
            {contextualItems.length > 0 && (
              <aside className="w-64 bg-white border-r border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  {currentSection?.title}
                </h2>
                <nav className="space-y-1">
                  {contextualItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ItemIcon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              {/* Content will be rendered here */}
            </div>
          </div>
        )}
      </main>

      {/* Floating User Menu */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setShowUserMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{user?.displayName || 'User'}</div>
                    <div className="text-sm text-white/80">{user?.primaryEmail}</div>
                  </div>
                </div>
                
                {/* Plan Badge */}
                <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <div>
                    <div className="text-xs text-white/80 mb-1">Current Plan</div>
                    <div className="font-semibold">Free</div>
                  </div>
                  <Link
                    href="/settings/billing"
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors font-medium text-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Upgrade
                  </Link>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FiUser size={20} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FiSettings size={20} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/settings/billing"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FiCreditCard size={20} />
                  <span>Billing</span>
                </Link>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => {
                    user?.signOut();
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 text-left"
                >
                  <FiLogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

