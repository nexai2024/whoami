import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { PageService } from '@/lib/database/pages';
import { AnalyticsService } from '@/lib/services/analyticsService';
import { useUserContext } from '@/lib/contexts/UserContext';
import { useFeatureGate } from '@/lib/hooks/useFeatureGate';
import { logger } from '@/lib/utils/logger';
import toast from 'react-hot-toast';
const {
  FiPlus, FiEdit3, FiBarChart3, FiSettings, FiEye, FiDollarSign,
  FiUsers, FiTrendingUp, FiExternalLink, FiCopy, FiMoreHorizontal,
  FiZap, FiRefreshCw, FiGift, FiCalendar, FiGrid, FiBook, FiGitBranch,
  FiFileText, FiShoppingBag, FiMail
} = FiIcons;

export default function Dashboard() {
  const { user, userId, isAuthenticated, loading: userLoading } = useUserContext();
  const { hasAccess: canCreatePage, limit: pageLimit, remaining: pagesRemaining, loading: featureLoading } = useFeatureGate('pages', { autoCheck: true });
  const { hasAccess: canCreateLeadMagnet, limit: leadMagnetLimit, remaining: leadMagnetsRemaining } = useFeatureGate('lead_magnets', { autoCheck: true });
  
  const [userPages, setUserPages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [leadMagnetCount, setLeadMagnetCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    if (userId && isAuthenticated) {
      loadDashboardData();
      checkCoachStatus();
      loadStats();
    }
  }, [userId, isAuthenticated]);

  const loadDashboardData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [pages, userAnalytics] = await Promise.all([
        PageService.getUserPages(userId),
        AnalyticsService.getUserAnalytics(userId, 30)
      ]);
      setUserPages(pages);
      setAnalytics(userAnalytics);
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCoachStatus = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        headers: { 'x-user-id': userId },
      });
      if (response.ok) {
        const profile = await response.json();
        setIsCoach(profile.isCoach || false);
      }
    } catch (error) {
      console.error('Error checking coach status:', error);
    }
  };

  const loadStats = async () => {
    if (!userId) return;
    
    try {
      // Load lead magnets count
      const lmRes = await fetch(`/api/lead-magnets?userId=${userId}`, {
        headers: { 'x-user-id': userId },
      });
      if (lmRes.ok) {
        const lmData = await lmRes.json();
        setLeadMagnetCount(lmData.leadMagnets?.length || 0);
      }

      // Load leads count
      const leadsRes = await fetch(`/api/leads?userId=${userId}`, {
        headers: { 'x-user-id': userId },
      });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeadsCount(leadsData.leads?.length || 0);
      }

      // Load bookings count (if coach)
      if (isCoach) {
        const bookingsRes = await fetch(`/api/bookings?userId=${userId}`, {
          headers: { 'x-user-id': userId },
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookingsCount(bookingsData.bookings?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // const createNewPage = async () => {
  //   const limitCheck = await RateLimitService.checkFeatureAccess(currUser?.id || stackUser?.id, 'pages');
  //   if (!limitCheck.allowed) {
  //     toast.error(limitCheck.message);
  //     return;
  //   } else {
  //     navigate('/builder?new=true');
  //   }
  // }
  const copyPageUrl = (slug) => {
    const pageUrl = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(pageUrl);
    toast.success('Page URL copied to clipboard!');
  };

  const handleCreatePageClick = (e) => {
    if (!canCreatePage) {
      e.preventDefault();
      toast.error(
        pagesRemaining !== null 
          ? `You've reached your page limit (${pageLimit} pages). Upgrade your plan to create more pages.`
          : 'You cannot create more pages. Please upgrade your plan.'
      );
    }
  };

  const handleCreateLeadMagnetClick = (e) => {
    if (!canCreateLeadMagnet) {
      e.preventDefault();
      toast.error(
        leadMagnetsRemaining !== null 
          ? `You've reached your lead magnet limit (${leadMagnetLimit} lead magnets). Upgrade your plan to create more.`
          : 'You cannot create more lead magnets. Please upgrade your plan.'
      );
    }
  };

  if (userLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const displayUser = user;

  // Hot items - most frequently used features
  const hotItems = [
    { 
      name: 'Create Page', 
      href: '/builder?new=true', 
      icon: FiFileText, 
      color: 'blue', 
      description: canCreatePage 
        ? (pagesRemaining !== null ? `${pagesRemaining} remaining` : 'Build your bio page')
        : 'Page limit reached',
      disabled: !canCreatePage,
      onClick: handleCreatePageClick
    },
    { 
      name: 'Create Lead Magnet', 
      href: '/marketing/lead-magnets', 
      icon: FiGift, 
      color: 'green', 
      description: canCreateLeadMagnet 
        ? (leadMagnetsRemaining !== null ? `${leadMagnetsRemaining} remaining` : 'Grow your email list')
        : 'Lead magnet limit reached',
      disabled: !canCreateLeadMagnet,
      onClick: handleCreateLeadMagnetClick,
      badge: leadMagnetCount
    },
    { name: 'Create Course', href: '/courses', icon: FiBook, color: 'purple', description: 'Share your knowledge' },
  ];

  // Contextual actions based on user type and activity
  const contextualActions = isCoach ? [
    { name: 'View Bookings', href: '/coach/bookings', icon: FiCalendar, color: 'orange', description: `${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''}`, badge: bookingsCount },
    { name: 'Manage Availability', href: '/coach/availability', icon: FiCalendar, color: 'blue', description: 'Set your schedule' },
  ] : [];

  // Feature connections - show related items
  const featureConnections = [
    leadMagnetCount > 0 ? { name: 'View Leads', href: '/leads', icon: FiUsers, color: 'teal', description: `${leadsCount} lead${leadsCount !== 1 ? 's' : ''}`, badge: leadsCount, connectFrom: 'Lead Magnets' } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {displayUser?.displayName || displayUser?.profile?.displayName || displayUser?.primaryEmail?.split('@')[0]}!
              </h1>
              <p className="text-gray-600">
                You have {userPages.length} page{userPages.length !== 1 ? 's' : ''} • 
                {analytics?.totals.pageViews ? ` ${analytics.totals.pageViews.toLocaleString()} total views` : ' Get started by creating your first page'}
              </p>
            </div>
            <Link 
              href="/builder?new=true"
              onClick={handleCreatePageClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                canCreatePage
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!canCreatePage ? `Page limit reached (${pageLimit} pages). Upgrade to create more.` : ''}
            >
              <SafeIcon name={undefined}  icon={FiPlus} />
              Create New Page
              {!canCreatePage && pagesRemaining !== null && (
                <span className="ml-2 text-xs">({pagesRemaining}/{pageLimit})</span>
              )}
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pages</p>
                <p className="text-2xl font-bold text-gray-900">{userPages.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <SafeIcon name={undefined}  icon={FiFileText} className="text-blue-600 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totals.pageViews?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <SafeIcon name={undefined}  icon={FiEye} className="text-green-600 text-xl" />
              </div>
            </div>
          </motion.div>

          {leadMagnetCount > 0 && (
            <motion.div
              className="bg-white rounded-xl shadow-sm border p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lead Magnets</p>
                  <p className="text-2xl font-bold text-gray-900">{leadMagnetCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <SafeIcon name={undefined}  icon={FiGift} className="text-purple-600 text-xl" />
                </div>
              </div>
            </motion.div>
          )}

          {leadsCount > 0 && (
            <motion.div
              className="bg-white rounded-xl shadow-sm border p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leadsCount}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <SafeIcon name={undefined}  icon={FiUsers} className="text-teal-600 text-xl" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hot Items - Most Used */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hot Items</h2>
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">Most Used</span>
            </div>

            <div className="space-y-3">
              {hotItems.map((item, index) => {
                const isDisabled = item.disabled || false;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={item.onClick}
                    className={`flex items-center gap-4 p-4 bg-gradient-to-r rounded-xl border transition-all group ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-100 hover:shadow-md'
                    }`}
                    title={isDisabled ? (item.name.includes('Page') ? `Page limit reached. Upgrade to create more pages.` : `Lead magnet limit reached. Upgrade to create more.`) : ''}
                  >
                    <div className={`p-3 bg-${item.color}-100 rounded-lg transition-colors ${
                      !isDisabled && `group-hover:bg-${item.color}-200`
                    }`}>
                      <SafeIcon name={undefined}  icon={item.icon} className={`text-${item.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>{item.name}</h3>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isDisabled && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                            Limit Reached
                          </span>
                        )}
                        {!isDisabled && item.name === 'Create Lead Magnet' && leadMagnetsRemaining !== null && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                            {leadMagnetsRemaining} left
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                    </div>
                    {!isDisabled && (
                      <SafeIcon name={undefined}  icon={FiExternalLink} className="text-gray-400 group-hover:text-gray-600" />
                    )}
                  </Link>
                );
              })}

              {/* Contextual Actions */}
              {contextualActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r hover:shadow-md transition-all rounded-xl border border-gray-100 group"
                >
                  <div className={`p-3 bg-${action.color}-100 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}>
                    <SafeIcon name={undefined}  icon={action.icon} className={`text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{action.name}</h3>
                      {action.badge !== undefined && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <SafeIcon name={undefined}  icon={FiExternalLink} className="text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}

              {/* Feature Connections */}
              {featureConnections.map((connection, index) => (
                <Link
                  key={index}
                  href={connection.href}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 hover:shadow-md transition-all rounded-xl border border-teal-100 group"
                >
                  <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <SafeIcon name={undefined}  icon={connection.icon} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{connection.name}</h3>
                      {connection.badge !== undefined && (
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-600 text-xs font-medium rounded-full">
                          {connection.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {connection.description}
                      {connection.connectFrom && (
                        <span className="ml-1 text-xs text-teal-600">← from {connection.connectFrom}</span>
                      )}
                    </p>
                  </div>
                  <SafeIcon name={undefined}  icon={FiExternalLink} className="text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions - Secondary */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

            <div className="space-y-3">
              <Link
                href="/workflows"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors group"
              >
                <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                  <SafeIcon name={undefined}  icon={FiGitBranch} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">Workflows</h3>
                  <p className="text-xs text-gray-600">Automate tasks</p>
                </div>
              </Link>

              <Link
                href="/marketing/campaigns/new"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
              >
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <SafeIcon name={undefined}  icon={FiZap} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">Campaigns</h3>
                  <p className="text-xs text-gray-600">Create campaign</p>
                </div>
              </Link>

              <Link
                href="/analytics"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                  <SafeIcon name={undefined}  icon={FiBarChart3} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">Analytics</h3>
                  <p className="text-xs text-gray-600">View insights</p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-colors group"
              >
                <div className="p-2 bg-gray-600 rounded-lg group-hover:bg-gray-700 transition-colors">
                  <SafeIcon name={undefined}  icon={FiSettings} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">Settings</h3>
                  <p className="text-xs text-gray-600">Manage account</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent Pages */}
        {userPages.length > 0 && (
          <motion.div
            className="mt-8 bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Pages</h2>
              <Link
                href="/builder?new=true"
                onClick={handleCreatePageClick}
                className={`text-sm font-medium transition-colors ${
                  canCreatePage
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={!canCreatePage ? `Page limit reached. Upgrade to create more.` : ''}
              >
                {canCreatePage ? 'Create New' : `Limit Reached (${pageLimit})`}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPages.slice(0, 6).map((page) => (
                <div
                  key={page.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{page.title || 'Untitled Page'}</h3>
                      <p className="text-xs text-gray-500">
                        {page.isActive ? 'Published' : 'Draft'} • {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/builder?page=${page.id}`}
                      className="flex-1 text-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => copyPageUrl(page.slug)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Copy URL"
                    >
                      <SafeIcon name={undefined}  icon={FiCopy} />
                    </button>
                    <Link
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="View Live"
                    >
                      <SafeIcon name={undefined}  icon={FiEye} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

