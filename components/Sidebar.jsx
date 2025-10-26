'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome, FiUser, FiUsers, FiFileText, FiBook, FiGift, FiShoppingBag,
  FiGitBranch, FiMail, FiCalendar, FiBarChart2, FiTrendingUp,
  FiSettings, FiCreditCard, FiShield, FiFolder, FiRefreshCw,
  FiChevronDown, FiChevronRight, FiMenu, FiX, FiLogOut, FiLink
} from 'react-icons/fi';
import { useUser } from "@stackframe/stack";
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    introduce: true,
    build: true,
    engage: true,
    settings: false,
    admin: false,
    misc: false
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const categories = [
    {
      id: 'introduce',
      name: 'Introduce',
      icon: FiUser,
      links: [
        { name: 'Profile', href: '/profile', icon: FiUser },
        { name: 'Creator Links', href: '/creator-links', icon: FiLink, comingSoon: true },
        { name: 'Bio Pages', href: '/bio', icon: FiFileText, comingSoon: true }
      ]
    },
    {
      id: 'build',
      name: 'Build',
      icon: FiFileText,
      links: [
        { name: 'Pages', href: '/builder', icon: FiFileText },
        { name: 'Courses', href: '/courses', icon: FiBook },
        { name: 'Lead Magnets', href: '/marketing/lead-magnets', icon: FiGift },
        { name: 'Funnels', href: '/funnels', icon: FiTrendingUp, comingSoon: true },
        { name: 'Products', href: '/marketing/products', icon: FiShoppingBag }
      ]
    },
    {
      id: 'engage',
      name: 'Engage',
      icon: FiUsers,
      links: [
        { name: 'Workflows', href: '/workflows', icon: FiGitBranch },
        { name: 'Campaigns', href: '/marketing/campaigns', icon: FiMail },
        { name: 'Schedule Posts', href: '/marketing/schedule', icon: FiCalendar },
        { name: 'Marketing Hub', href: '/marketing', icon: FiTrendingUp },
        { name: 'Analytics', href: '/analytics', icon: FiBarChart2 }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: FiSettings,
      links: [
        { name: 'Account Settings', href: '/settings', icon: FiSettings },
        { name: 'Billing', href: '/settings/billing', icon: FiCreditCard }
      ]
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: FiShield,
      links: []
    },
    {
      id: 'misc',
      name: 'Misc',
      icon: FiFolder,
      links: [
        { name: 'Media', href: '/media', icon: FiFolder },
        { name: 'Repurpose Content', href: '/marketing/repurpose', icon: FiRefreshCw }
      ]
    }
  ];

  const isLinkActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
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
        {/* Dashboard Link (Top Level) */}
        <Link
          href="/dashboard"
          onClick={closeMobileMenu}
          className={`flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg transition-all ${
            isLinkActive('/dashboard')
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
                {category.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.comingSoon ? '#' : link.href}
                    onClick={link.comingSoon ? (e) => e.preventDefault() : closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative ${
                      isLinkActive(link.href)
                        ? 'bg-indigo-600 text-white border-l-4 border-indigo-400'
                        : link.comingSoon
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <link.icon size={18} />
                    {!collapsed && (
                      <>
                        <span className="text-sm">{link.name}</span>
                        {link.comingSoon && (
                          <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
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
              {currUser?.profile?.displayName?.[0]?.toUpperCase() ||
               currUser?.profile?.username?.[0]?.toUpperCase() ||
               'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currUser?.profile?.displayName || currUser?.profile?.username || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currUser?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
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
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
