'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome, FiUser, FiUsers, FiFileText, FiBook, FiGift, FiShoppingBag,
  FiGitBranch, FiMail, FiCalendar, FiBarChart2, FiTrendingUp,
  FiSettings, FiCreditCard, FiShield, FiFolder, FiRefreshCw,
  FiChevronDown, FiChevronRight, FiMenu, FiX, FiLogOut, FiLink, 
  FiGlobe, FiPlus, FiLayers, FiActivity
} from 'react-icons/fi';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';

export default function Sidebar() {
  const { currUser } = useAuth();
  const stackUser = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    create: true,  // Open by default - most used
    manage: true,  // Open by default - manage what you created
    grow: false,
    analyze: false,
    settings: false
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Check if user is a coach
  useEffect(() => {
    const checkCoachStatus = async () => {
      if (stackUser?.id) {
        try {
          const response = await fetch(`/api/profiles/${stackUser.id}`, {
            headers: { 'x-user-id': stackUser.id },
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
  }, [stackUser]);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));

    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsed }
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // Organized navigation structure - flows logically
  const categories = [
    {
      id: 'create',
      name: 'Create',
      icon: FiPlus,
      description: 'Build content',
      links: [
        { name: 'Pages', href: '/dashboard', icon: FiFileText, hot: true, description: 'Build bio pages' },
        { name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift, hot: true, description: 'Grow your list' },
        { name: 'Courses', href: '/courses?new=true', icon: FiBook, hot: true, description: 'Create courses' },
        { name: 'Products', href: '/marketing/products', icon: FiShoppingBag, description: 'Sell digital products' },
        { name: 'Funnels', href: '/funnels?new=true', icon: FiTrendingUp, description: 'Build sales funnels' },
      ]
    },
    {
      id: 'manage',
      name: 'Manage',
      icon: FiLayers,
      description: 'Your content',
      links: [
        { name: 'All Pages', href: '/dashboard', icon: FiFileText },
        { name: 'My Courses', href: '/my-courses', icon: FiBook },
        { name: 'Campaigns', href: '/marketing/campaigns', icon: FiMail },
        { name: 'Workflows', href: '/workflows', icon: FiGitBranch, description: 'Automations' },
        { name: 'Schedule Posts', href: '/marketing/schedule', icon: FiCalendar },
        ...(isCoach ? [
          { name: 'Bookings', href: '/coach/bookings', icon: FiCalendar, hot: true, description: 'Client bookings' },
          { name: 'Availability', href: '/coach/availability', icon: FiCalendar, description: 'Set schedule' },
        ] : []),
      ]
    },
    {
      id: 'grow',
      name: 'Grow',
      icon: FiTrendingUp,
      description: 'Marketing & leads',
      links: [
        { name: 'Leads', href: '/leads', icon: FiUsers, hot: true, description: 'From Lead Magnets', connectFrom: 'Lead Magnets' },
        { name: 'Marketing Hub', href: '/marketing', icon: FiTrendingUp },
      ]
    },
    {
      id: 'analyze',
      name: 'Analyze',
      icon: FiActivity,
      description: 'Performance',
      links: [
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
        { name: 'Campaign Analytics', href: '/marketing/analytics', icon: FiBarChart2 },
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: FiSettings,
      description: 'Account & preferences',
      links: [
        { name: 'Account', href: '/settings', icon: FiSettings },
        ...(isCoach ? [
          { name: 'Coach Settings', href: '/settings', icon: FiUser, tab: 'coach' },
        ] : []),
        { name: 'Billing', href: '/settings/billing', icon: FiCreditCard },
        { name: 'Profile', href: '/profile', icon: FiUser },
      ]
    }
  ];

  const isLinkActive = (href, exactMatch) => {
    // Handle query params
    const cleanHref = href.split('?')[0];
    
    if (exactMatch || (href.includes('match'))) {
      return pathname === cleanHref;
    }
    
    // Special cases
    if (cleanHref === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // Default: check if pathname starts with href
    return pathname.startsWith(cleanHref);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              whoami
            </span>
          </Link>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Dashboard Link (Top Level) - Hot Item */}
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className={`flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg transition-all ${
            isLinkActive('/dashboard', true)
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FiHome size={20} />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </Link>

        {/* Categories */}
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <category.icon size={16} />
                {!collapsed && <span>{category.name}</span>}
              </div>
              {!collapsed && (
                expandedCategories[category.id] ?
                  <FiChevronDown size={14} /> :
                  <FiChevronRight size={14} />
              )}
            </button>

            {/* Category Links */}
            {expandedCategories[category.id] && category.links.length > 0 && (
              <div className="mt-1 space-y-1">
                {category.links.map((link) => {
                  const active = isLinkActive(link.href, link.match);
                  const href = link.tab ? `${link.href}?tab=${link.tab}` : link.href;
                  return (
                    <Link
                      key={link.href}
                      href={href}
                      onClick={() => {
                        if (link.tab) {
                          // Handle tab navigation in settings
                          const event = new CustomEvent('settingsTabChange', { detail: { tab: link.tab } });
                          window.dispatchEvent(event);
                        }
                        closeMobileMenu();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group ${
                        active
                          ? 'bg-indigo-600 text-white border-l-4 border-indigo-400'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      title={link.description || link.connectFrom ? `← from ${link.connectFrom}` : undefined}
                    >
                      <link.icon size={18} />
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{link.name}</span>
                              {link.hot && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                  Hot
                                </span>
                              )}
                            </div>
                            {link.description && (
                              <p className="text-xs text-gray-400 truncate">{link.description}</p>
                            )}
                            {link.connectFrom && (
                              <p className="text-xs text-gray-400">
                                ← from {link.connectFrom}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Empty state for categories with no links */}
            {expandedCategories[category.id] && category.links.length === 0 && !collapsed && (
              <div className="px-3 py-2 text-xs text-gray-500 italic">
                No items yet
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-700 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {currUser?.displayName?.[0]?.toUpperCase() ||
               currUser?.primaryEmail?.[0]?.toUpperCase() ||
               stackUser?.displayName?.[0]?.toUpperCase() ||
               stackUser?.primaryEmail?.[0]?.toUpperCase() ||
               'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currUser?.displayName || stackUser?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currUser?.primaryEmail || stackUser?.primaryEmail || ''}
              </p>
            </div>
            <button
              onClick={() => {
                if (stackUser && typeof stackUser.signOut === 'function') {
                  stackUser.signOut();
                }
                router.push('/');
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (stackUser && typeof stackUser.signOut === 'function') {
                stackUser.signOut();
              }
              router.push('/');
            }}
            className="w-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <FiLogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${
          collapsed ? 'w-16' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Spacer for desktop sidebar */}
      <div className={`hidden lg:block ${collapsed ? 'w-16' : 'w-72'} transition-all duration-300`} />
    </>
  );
}
