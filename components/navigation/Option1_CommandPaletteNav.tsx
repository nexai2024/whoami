'use client';

/**
 * Option 1: Command Palette + Top Navigation System
 * Modern navigation with Cmd+K command palette and top navigation bar
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  FiSearch, FiBell, FiUser, FiSettings, FiCreditCard,
  FiLogOut, FiChevronDown, FiZap, FiHome, FiFileText,
  FiBook, FiGift, FiTrendingUp, FiBarChart2, FiLayers,
  FiX, FiCommand
} from 'react-icons/fi';
import Logo from '../Logo';

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  category: string;
  keywords: string[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: FiHome, category: 'General', keywords: ['home', 'main'] },
  { id: 'pages', name: 'Pages', href: '/dashboard', icon: FiFileText, category: 'Create', keywords: ['bio', 'page', 'landing'] },
  { id: 'courses', name: 'Courses', href: '/courses', icon: FiBook, category: 'Create', keywords: ['course', 'lms', 'learn'] },
  { id: 'lead-magnets', name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift, category: 'Create', keywords: ['lead', 'magnet', 'optin'] },
  { id: 'analytics', name: 'Analytics', href: '/analytics', icon: FiBarChart2, category: 'Analyze', keywords: ['stats', 'metrics', 'data'] },
  { id: 'workflows', name: 'Workflows', href: '/workflows', icon: FiZap, category: 'Manage', keywords: ['automation', 'workflow'] },
];

export default function CommandPaletteNav() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter nav items based on search
  const filteredItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle command palette navigation
  useEffect(() => {
    if (!showCommandPalette) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          router.push(filteredItems[selectedIndex].href);
          setShowCommandPalette(false);
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, filteredItems, selectedIndex, router]);

  const handleNavItemClick = (href: string) => {
    router.push(href);
    setShowCommandPalette(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 lg:px-6">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            whoami
          </span>
        </Link>

        {/* Center: Search Bar (triggers command palette) */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-8 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <FiSearch size={18} />
          <span className="text-sm">Search or jump to...</span>
          <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
            <FiCommand size={12} />K
          </kbd>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Upgrade Button - Always Visible */}
          <Link
            href="/settings/billing"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-sm"
          >
            <FiZap size={16} />
            <span>Upgrade</span>
          </Link>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <FiChevronDown size={16} className="hidden sm:block text-gray-600" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-gray-600">{user?.primaryEmail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Free Plan
                      </span>
                      <Link
                        href="/settings/billing"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Upgrade →
                      </Link>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/settings/billing"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiCreditCard size={18} />
                    <span>Billing</span>
                  </Link>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => {
                      user?.signOut();
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-left"
                  >
                    <FiLogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32 px-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
              <FiSearch size={20} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type to search or jump to..."
                className="flex-1 outline-none text-lg"
                autoFocus
              />
              <button
                onClick={() => setShowCommandPalette(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No results found
                </div>
              ) : (
                <div className="py-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavItemClick(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-indigo-50' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {typeof Icon === 'string' ? (
                          <span className="text-gray-600">
                            {Icon}
                          </span>
                        ) : (
                          <Icon size={20} />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </div>
                        {pathname === item.href && (
                          <span className="text-xs text-indigo-600 font-medium">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}

