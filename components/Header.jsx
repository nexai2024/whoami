"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { PageService } from '../lib/database/pages';
import { logger } from '../lib/utils/logger';
import { useUser } from "@stackframe/stack"
import toast from 'react-hot-toast';

const { 
  FiUser, FiLogOut, FiSettings, FiEye, FiPlus, FiChevronDown, 
  FiHome, FiBarChart3, FiEdit3, FiDollarSign, FiHelpCircle, 
  FiGlobe, FiCopy, FiExternalLink, FiFolder, FiImage
} = FiIcons;

const Header = () => {
  const [user, setUser] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const pagesDropdownRef = useRef(null);
  const stackUser = useUser();

  useEffect(() => {
    loadUserData();
  }, [stackUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target)) {
        setPagesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (!stackUser) return;
      
      const pages = await PageService.getUserPages(stackUser.id);
      setUser(stackUser);
      setUserPages(pages);
      setCurrentPage(pages[0] || null);
    } catch (error) {
      logger.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!currentPage) {
      toast.error('No page selected for preview');
      return;
    }
    
    // Open preview in new window
    const previewUrl = `${window.location.origin}/${currentPage.slug}`;
    const previewWindow = window.open(
      previewUrl,
      'preview',
      'width=400,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (previewWindow) {
      previewWindow.focus();
      logger.info(`Preview opened for page: ${currentPage.slug}`);
    } else {
      toast.error('Please allow popups to use the preview feature');
    }
  };

  const copyPageUrl = () => {
    if (!currentPage) return;
    const pageUrl = `${window.location.origin}/${currentPage.slug}`;
    navigator.clipboard.writeText(pageUrl);
    toast.success('Page URL copied to clipboard!');
  };

  const handleCreateNewPage = () => {
    router.push('/builder?new=true');
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: FiHome },
    { label: 'Pages', path: '/pages', icon: FiFolder },
    { label: 'Builder', path: '/builder', icon: FiEdit3 },
    { label: 'Analytics', path: '/analytics', icon: FiBarChart3 },
    { label: 'Media', path: '/media', icon: FiImage },
    { label: 'Pricing', path: '/pricing', icon: FiDollarSign }
  ];

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              WhoAmI
            </Link>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="text-sm" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - Page selector, Preview, User menu */}
          <div className="flex items-center gap-4">
            {/* Page Selector Dropdown */}
            {userPages.length > 0 && (
              <div className="relative" ref={pagesDropdownRef}>
                <button
                  onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <SafeIcon icon={FiGlobe} />
                  <span className="hidden sm:inline">
                    {currentPage?.title || 'Select Page'}
                  </span>
                  <SafeIcon icon={FiChevronDown} className="text-xs" />
                </button>

                <AnimatePresence>
                  {pagesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                        Your Pages
                      </div>
                      {userPages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setCurrentPage(page);
                            setPagesDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                            currentPage?.id === page.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{page.title}</div>
                              <div className="text-xs text-gray-500">/{page.slug}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${page.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={() => {
                            handleCreateNewPage();
                            setPagesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-indigo-600 flex items-center gap-2"
                        >
                          <SafeIcon icon={FiPlus} />
                          Create New Page
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Page Actions */}
            {currentPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPageUrl}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  title="Copy page URL"
                >
                  <SafeIcon icon={FiCopy} />
                  <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  <SafeIcon icon={FiEye} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>
            )}

            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user?.displayName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.displayName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.plan?.toLowerCase() || 'Free'} Plan
                  </div>
                </div>
                <SafeIcon icon={FiChevronDown} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b">
                      <div className="font-medium text-gray-900">
                        {user?.displayName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.primaryEmail}
                      </div>
                    </div>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <SafeIcon icon={FiSettings} />
                      Settings
                    </Link>

                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <SafeIcon icon={FiHelpCircle} />
                      Help & Support
                    </Link>

                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          // Handle logout with Stack
                          if (stackUser && typeof stackUser.signOut === 'function') {
                            stackUser.signOut();
                          }
                          router.push('/');
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <SafeIcon icon={FiLogOut} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-2">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === item.path
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-sm" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;