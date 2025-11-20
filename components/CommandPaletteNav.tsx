'use client';

/**
 * Option 1: Command Palette + Top Navigation System
 * Modern navigation with Cmd+K command palette and top navigation bar
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  FiSearch, FiBell, FiUser, FiSettings, FiCreditCard,
  FiLogOut, FiChevronDown, FiZap, FiHome, FiFileText,
  FiBook, FiGift, FiTrendingUp, FiBarChart2, FiLayers,
  FiX, FiCommand, FiMail, FiCalendar, FiUsers, FiActivity,
  FiShoppingBag, FiGitBranch
} from 'react-icons/fi';
import Logo from './Logo';

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  category: string;
  keywords: string[];
  description?: string;
  hot?: boolean;
  requiresCoach?: boolean;
  tab?: string;
}

export default function CommandPaletteNav() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCoach, setIsCoach] = useState(false);
  const [subscription, setSubscription] = useState<{ plan: { name: string } } | null>(null);
  const [planName, setPlanName] = useState('Free');

  // Check if user is a coach
  useEffect(() => {
    const checkCoachStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/profiles/${user.id}`, {
            headers: { 'x-user-id': user.id },
          });
          if (response.ok) {
            const profile = await response.json();
            setIsCoach(profile.isCoach || false);
          }
        } catch (error) {
          console.error('Error checking coach status:', error);
        }
      }
    };
    checkCoachStatus();
  }, [user]);

  // Fetch subscription info
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/subscriptions?userId=${user.id}`, {
            headers: { 'x-user-id': user.id },
          });
          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
            setPlanName(data.plan?.name || 'Free');
          } else {
            setPlanName('Free');
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setPlanName('Free');
        }
      }
    };
    fetchSubscription();
  }, [user]);

  // All navigation items - comprehensive list
  const allNavItems: NavItem[] = [
    // General
    { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: FiHome, category: 'General', keywords: ['home', 'main', 'dash'] },
    
    // Create
    { id: 'pages', name: 'Pages', href: '/dashboard', icon: FiFileText, category: 'Create', keywords: ['bio', 'page', 'landing', 'builder'], description: 'Build bio pages', hot: true },
    { id: 'courses', name: 'Courses', href: '/courses?new=true', icon: FiBook, category: 'Create', keywords: ['course', 'lms', 'learn', 'training'], description: 'Create courses', hot: true },
    { id: 'lead-magnets', name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift, category: 'Create', keywords: ['lead', 'magnet', 'optin', 'opt-in'], description: 'Grow your list', hot: true },
    { id: 'products', name: 'Products', href: '/marketing/products', icon: FiShoppingBag, category: 'Create', keywords: ['product', 'sell', 'digital'], description: 'Sell digital products' },
    { id: 'funnels', name: 'Funnels', href: '/funnels?new=true', icon: FiTrendingUp, category: 'Create', keywords: ['funnel', 'sales'], description: 'Build sales funnels' },
    
    // Manage
    { id: 'all-pages', name: 'All Pages', href: '/dashboard', icon: FiFileText, category: 'Manage', keywords: ['pages', 'all'] },
    { id: 'my-courses', name: 'My Courses', href: '/my-courses', icon: FiBook, category: 'Manage', keywords: ['courses', 'my'] },
    { id: 'campaigns', name: 'Campaigns', href: '/marketing/campaigns', icon: FiMail, category: 'Manage', keywords: ['campaign', 'email'] },
    { id: 'workflows', name: 'Workflows', href: '/workflows', icon: FiGitBranch, category: 'Manage', keywords: ['workflow', 'automation'], description: 'Automations' },
    { id: 'schedule', name: 'Schedule Posts', href: '/marketing/schedule', icon: FiCalendar, category: 'Manage', keywords: ['schedule', 'post', 'social'] },
    { id: 'bookings', name: 'Bookings', href: '/coach/bookings', icon: FiCalendar, category: 'Manage', keywords: ['booking', 'appointment', 'session'], description: 'Client bookings', hot: true, requiresCoach: true },
    { id: 'availability', name: 'Availability', href: '/coach/availability', icon: FiCalendar, category: 'Manage', keywords: ['availability', 'schedule', 'calendar'], description: 'Set schedule', requiresCoach: true },
    
    // Grow
    { id: 'leads', name: 'Leads', href: '/leads', icon: FiUsers, category: 'Grow', keywords: ['lead', 'contact'], description: 'From Lead Magnets', hot: true },
    { id: 'marketing-hub', name: 'Marketing Hub', href: '/marketing', icon: FiTrendingUp, category: 'Grow', keywords: ['marketing', 'hub'] },
    
    // Analyze
    { id: 'analytics', name: 'Analytics', href: '/analytics', icon: FiBarChart2, category: 'Analyze', keywords: ['stats', 'metrics', 'data', 'analytics'] },
    { id: 'campaign-analytics', name: 'Campaign Analytics', href: '/marketing/analytics', icon: FiBarChart2, category: 'Analyze', keywords: ['campaign', 'analytics', 'metrics'] },
    { id: 'coach-analytics', name: 'Coach Analytics', href: '/coach/analytics', icon: FiBarChart2, category: 'Analyze', keywords: ['coach', 'analytics'], requiresCoach: true },
    
    // Settings
    { id: 'account', name: 'Account', href: '/settings', icon: FiSettings, category: 'Settings', keywords: ['account', 'settings'] },
    { id: 'billing', name: 'Billing', href: '/settings/billing', icon: FiCreditCard, category: 'Settings', keywords: ['billing', 'payment', 'subscription', 'plan', 'upgrade'] },
    { id: 'profile', name: 'Profile', href: '/profile', icon: FiUser, category: 'Settings', keywords: ['profile', 'user'] },
    { id: 'coach-settings', name: 'Coach Settings', href: '/settings', icon: FiUser, category: 'Settings', keywords: ['coach', 'settings'], tab: 'coach', requiresCoach: true },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => !item.requiresCoach || isCoach);

  // Filter nav items based on search
  const filteredItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle command palette navigation
  useEffect(() => {
    if (!showCommandPalette) {
      setSearchQuery('');
      setSelectedIndex(0);
      return;
    }

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
          handleNavItemClick(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, filteredItems, selectedIndex]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleNavItemClick = useCallback((item: NavItem) => {
    if (item.tab) {
      // Handle tab navigation in settings
      const event = new CustomEvent('settingsTabChange', { detail: { tab: item.tab } });
      window.dispatchEvent(event);
      router.push(item.href);
    } else {
      router.push(item.href);
    }
    setShowCommandPalette(false);
    setSearchQuery('');
  }, [router]);

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/dashboard' }];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const item = navItems.find(n => {
        const cleanHref = n.href.split('?')[0];
        return cleanHref === currentPath || (index === 0 && segment === 'dashboard');
      });
      
      if (item && item.name !== 'Dashboard') {
        breadcrumbs.push({ name: item.name, href: currentPath });
      } else if (segment !== 'dashboard') {
        // Capitalize segment name for display
        const name = segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        breadcrumbs.push({ name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo />
          <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            whoami
          </span>
        </Link>

        {/* Center: Search Bar (triggers command palette) */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-8 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-all group"
        >
          <FiSearch size={18} className="text-gray-400 group-hover:text-gray-600" />
          <span className="text-sm flex-1 text-left">Search or jump to...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-600">
            <FiCommand size={12} />K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Search"
        >
          <FiSearch size={20} />
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Upgrade Button - Always Visible */}
          <Link
            href="/settings/billing"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
          >
            <FiZap size={16} />
            <span>Upgrade</span>
          </Link>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.displayName?.[0]?.toUpperCase() || user?.primaryEmail?.[0]?.toUpperCase() || 'U'}
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
                    <p className="font-semibold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                    <p className="text-sm text-gray-600 truncate">{user?.primaryEmail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        planName === 'Free' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {planName} Plan
                      </span>
                      <Link
                        href="/settings/billing"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {planName === 'Free' ? 'Upgrade →' : 'Manage →'}
                      </Link>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiUser size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/settings/billing"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
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
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors text-left"
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

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className="fixed top-16 left-0 right-0 h-10 bg-gray-50 border-b border-gray-200 z-40 px-4 lg:px-6 flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.href}-${index}`}>
              {index > 0 && <span className="text-gray-400">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32 px-4"
          onClick={() => setShowCommandPalette(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="flex-1 outline-none text-lg bg-transparent"
                autoFocus
              />
              <button
                onClick={() => setShowCommandPalette(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <FiX size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p>No results found</p>
                  <p className="text-xs text-gray-400 mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="py-2">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;
                    const cleanHref = item.href.split('?')[0];
                    const isActive = pathname === item.href || pathname === cleanHref || pathname?.startsWith(cleanHref);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavItemClick(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                          isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {/* Icon components used here (e.g. from react-icons) do not accept className directly.
                            To style the icon, wrap it in a span with the desired class. */}
                        <span className={isSelected ? 'text-indigo-600' : 'text-gray-600'}>
                          <Icon size={20} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {item.name}
                            </span>
                            {item.hot && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
                                Hot
                              </span>
                            )}
                            {isActive && (
                              <span className="text-xs text-indigo-600 font-medium">Current</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{item.category}</span>
                            {item.description && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{item.description}</span>
                              </>
                            )}
                          </div>
                        </div>
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

      {/* Spacer for fixed nav and breadcrumbs */}
      <div className={breadcrumbs.length > 1 ? 'h-26' : 'h-16'} />
    </>
  );
}

