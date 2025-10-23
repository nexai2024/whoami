import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next/link';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { PageService } from '../lib/database/pages';
import { AnalyticsService } from '../lib/database/analytics';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import { logger } from '../lib/utils/logger';
import MyAccountPage from './MyAccount';
import toast from 'react-hot-toast';
const {
  FiPlus, FiEdit3, FiBarChart3, FiSettings, FiEye, FiDollarSign,
  FiUsers, FiTrendingUp, FiExternalLink, FiCopy, FiMoreHorizontal,
  FiZap, FiRefreshCw, FiGift, FiCalendar, FiGrid
} = FiIcons;

const Dashboard = () => {
  const { currUser } = useAuth();
  const [userPages, setUserPages] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currUser) {
      console.log("Current Dashboard User", currUser)
      loadDashboardData();
    }
  }, [currUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pages, userAnalytics] = await Promise.all([
        PageService.getUserPages(currUser.id),
        AnalyticsService.getUserAnalytics(currUser.id, 30)
      ]);
      setUserPages(pages);
      setAnalytics(userAnalytics);
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPageUrl = (slug) => {
    const pageUrl = `${window.location.origin}/#/${slug}`;
    navigator.clipboard.writeText(pageUrl);
    toast.success('Page URL copied to clipboard!');
  };

  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = analytics ? [
    {
      label: 'Total Clicks',
      value: analytics.totals.totalClicks.toLocaleString(),
      change: analytics.changes.totalClicks,
      icon: FiEye,
      color: 'blue'
    },
    {
      label: 'Revenue',
      value: `$${analytics.totals.revenue.toLocaleString()}`,
      change: analytics.changes.revenue,
      icon: FiDollarSign,
      color: 'green'
    },
    {
      label: 'Page Views',
      value: analytics.totals.pageViews.toLocaleString(),
      change: analytics.changes.pageViews,
      icon: FiUsers,
      color: 'purple'
    },
    {
      label: 'Unique Visitors',
      value: analytics.totals.uniqueVisitors.toLocaleString(),
      change: analytics.changes.uniqueVisitors,
      icon: FiTrendingUp,
      color: 'orange'
    }
  ] : [];

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
                Welcome back, {currUser.profile?.displayName || currUser.profile?.username}!
              </h1>
              <p className="text-gray-600">
                You have {userPages.length} page{userPages.length !== 1 ? 's' : ''} • 
                Total views: {analytics?.totals.pageViews.toLocaleString() || 0}
              </p>
            </div>
            <Link
              to="/builder?new=true"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} />
              Create New Page
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <SafeIcon icon={stat.icon} className={`text-${stat.color}-600 text-xl`} />
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Your Pages */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Pages</h2>
              <Link
                to="/builder?new=true"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <SafeIcon icon={FiPlus} />
                New Page
              </Link>
            </div>
            
            <div className="space-y-4">
              {userPages.map((page, index) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{page.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${page.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">/{page.slug}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{page._count?.clicks || 0} clicks</span>
                      <span>{page.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyPageUrl(page.slug)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      <SafeIcon icon={FiCopy} />
                    </button>
                    <Link
                      to={`/analytics?page=${page.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Analytics"
                    >
                      <SafeIcon icon={FiBarChart3} />
                    </Link>
                    <Link
                      to={`/builder?page=${page.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit Page"
                    >
                      <SafeIcon icon={FiEdit3} />
                    </Link>
                    <a
                      href={page.customDomain ? `https://${page.customDomain}` : `/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Live"
                    >
                      <SafeIcon icon={FiExternalLink} />
                    </a>
                  </div>
                </div>
              ))}
              
              {userPages.length === 0 && (
                <div className="text-center py-12">
                  <SafeIcon icon={FiPlus} className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No pages created yet</p>
                  <Link
                    to="/builder?new=true"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <SafeIcon icon={FiPlus} />
                    Create Your First Page
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions 3</h2>
            
            <div className="space-y-4">
              <Link
                to="/builder"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors group"
              >
                <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                  <SafeIcon icon={FiEdit3} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Edit Page</h3>
                  <p className="text-sm text-gray-600">Customize your layout</p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                  <SafeIcon icon={FiBarChart3} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-600">Track performance</p>
                </div>
              </Link>

               <Link
                to="/settings"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors group"
              >
                <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                  <SafeIcon icon={FiSettings} className="text-white" />
                </div>
                <div className="text-left">
                   <h3 className="font-medium text-gray-900">Settings</h3>
                  <MyAccountPage />
                  <p className="text-sm text-gray-600">Manage account</p>
                </div>
              </Link>

              {/* NEW: Marketing Category */}

              <Link
                to="/marketing"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                  <SafeIcon icon={FiBarChart3} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Marketing</h3>
                  <p className="text-sm text-gray-600">Marketing tools</p>
                </div>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Marketing
                </h3>
                
                <Link
                  to="/marketing/campaigns/new"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors group mb-3"
                >
                  <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                    <SafeIcon icon={FiZap} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Generate Campaign</h3>
                    <p className="text-sm text-gray-600">AI multi-channel</p>
                  </div>
                </Link>

                <Link
                  to="/marketing/repurpose"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors group mb-3"
                >
                  <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                    <SafeIcon icon={FiRefreshCw} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Repurpose Content</h3>
                    <p className="text-sm text-gray-600">Transform content</p>
                  </div>
                </Link>

                <Link
                  to="/marketing/lead-magnets"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-colors group mb-3"
                >
                  <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                    <SafeIcon icon={FiGift} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Lead Magnets</h3>
                    <p className="text-sm text-gray-600">Build your list</p>
                  </div>
                </Link>

                <Link
                  to="/marketing/schedule"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors group mb-3"
                >
                  <div className="p-2 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                    <SafeIcon icon={FiCalendar} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Schedule Posts</h3>
                    <p className="text-sm text-gray-600">Plan content</p>
                  </div>
                </Link>

                <Link
                  to="/marketing"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-gray-100 hover:to-blue-100 transition-colors group"
                >
                  <div className="p-2 bg-gray-600 rounded-lg group-hover:bg-gray-700 transition-colors">
                    <SafeIcon icon={FiGrid} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing Hub</h3>
                    <p className="text-sm text-gray-600">View all tools</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;