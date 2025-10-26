import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'next/link';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { PageService } from '../lib/database/pages';
import { logger } from '../lib/utils/logger';
import toast from 'react-hot-toast';

const { 
  FiPlus, FiEdit3, FiEye, FiCopy, FiTrash2, FiSettings, 
  FiBarChart3, FiGlobe, FiToggleLeft, FiToggleRight,
  FiMoreHorizontal, FiExternalLink, FiArchive, FiShare2
} = FiIcons;

const PageManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, draft

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedPages.length > 0);
  }, [selectedPages]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const userPages = await PageService.getUserPages('user_1');
      // Add mock status and additional data
      const enhancedPages = userPages.map(page => ({
        ...page,
        status: page.isActive ? 'published' : 'draft',
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        customDomain: Math.random() > 0.7 ? `${page.slug}.com` : null,
        totalViews: page._count.clicks || 0,
        monthlyViews: Math.floor((page._count.clicks || 0) * 0.3),
        conversionRate: (Math.random() * 10).toFixed(1)
      }));
      setPages(enhancedPages);
    } catch (error) {
      logger.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageId) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleSelectAll = () => {
    const filteredPageIds = getFilteredPages().map(page => page.id);
    setSelectedPages(
      selectedPages.length === filteredPageIds.length ? [] : filteredPageIds
    );
  };

  const handleToggleStatus = async (pageId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await PageService.updatePage(pageId, { 
        isActive: newStatus === 'published',
        status: newStatus 
      });
      
      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? { ...page, status: newStatus, isActive: newStatus === 'published' }
          : page
      ));
      
      logger.info(`Page ${pageId} status changed to ${newStatus}`);
    } catch (error) {
      logger.error('Error toggling page status:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'publish':
          for (const pageId of selectedPages) {
            await PageService.updatePage(pageId, { isActive: true, status: 'published' });
          }
          setPages(prev => prev.map(page => 
            selectedPages.includes(page.id) 
              ? { ...page, status: 'published', isActive: true }
              : page
          ));
          break;
          
        case 'unpublish':
          for (const pageId of selectedPages) {
            await PageService.updatePage(pageId, { isActive: false, status: 'draft' });
          }
          setPages(prev => prev.map(page => 
            selectedPages.includes(page.id) 
              ? { ...page, status: 'draft', isActive: false }
              : page
          ));
          break;
          
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedPages.length} page(s)?`)) {
            for (const pageId of selectedPages) {
              await PageService.deletePage(pageId);
            }
            setPages(prev => prev.filter(page => !selectedPages.includes(page.id)));
          }
          break;
      }
      
      setSelectedPages([]);
      logger.info(`Bulk action ${action} completed for ${selectedPages.length} pages`);
    } catch (error) {
      logger.error(`Error performing bulk action ${action}:`, error);
    }
  };

  const copyPageUrl = (slug) => {
    const pageUrl = `${window.location.origin}/#/${slug}`;
    navigator.clipboard.writeText(pageUrl);
    toast.success('Page URL copied to clipboard!');
  };

  const duplicatePage = async (page) => {
    try {
      const newPage = await PageService.createPage('user_1', {
        title: `${page.title} (Copy)`,
        description: page.description
      });
      
      setPages(prev => [...prev, {
        ...newPage,
        status: 'draft',
        lastModified: new Date(),
        totalViews: 0,
        monthlyViews: 0,
        conversionRate: '0.0'
      }]);
      
      logger.info(`Page duplicated: ${page.id} -> ${newPage.id}`);
    } catch (error) {
      logger.error('Error duplicating page:', error);
    }
  };

  const getFilteredPages = () => {
    return pages.filter(page => {
      switch (filterStatus) {
        case 'active':
          return page.status === 'published';
        case 'inactive':
          return page.status === 'draft';
        case 'published':
          return page.status === 'published';
        case 'draft':
          return page.status === 'draft';
        default:
          return true;
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const PageCard = ({ page }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <motion.div
        className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedPages.includes(page.id)}
                onChange={() => handlePageSelect(page.id)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{page.title}</h3>
                <p className="text-sm text-gray-500">/{page.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(page.status)}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SafeIcon name={undefined}  icon={FiMoreHorizontal} />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10"
                    >
                      <button
                        onClick={() => {
                          duplicatePage(page);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <SafeIcon name={undefined}  icon={FiCopy} className="inline mr-2" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          handleToggleStatus(page.id, page.status);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <SafeIcon name={undefined}  icon={page.status === 'published' ? FiArchive : FiEye} className="inline mr-2" />
                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this page?')) {
                            PageService.deletePage(page.id);
                            setPages(prev => prev.filter(p => p.id !== page.id));
                          }
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <SafeIcon name={undefined}  icon={FiTrash2} className="inline mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Total Views</p>
              <p className="font-semibold text-gray-900">{page.totalViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">This Month</p>
              <p className="font-semibold text-gray-900">{page.monthlyViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Conversion</p>
              <p className="font-semibold text-gray-900">{page.conversionRate}%</p>
            </div>
          </div>

          {/* Domain */}
          {page.customDomain && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <SafeIcon name={undefined}  icon={FiGlobe} />
                <span>{page.customDomain}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(page.id, page.status)}
                className={`flex items-center gap-1 text-sm font-medium ${
                  page.status === 'published' 
                    ? 'text-green-600 hover:text-green-700' 
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <SafeIcon name={undefined}  icon={page.status === 'published' ? FiToggleRight : FiToggleLeft} />
                {page.status === 'published' ? 'Published' : 'Draft'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyPageUrl(page.slug)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy URL"
              >
                <SafeIcon name={undefined}  icon={FiShare2} />
              </button>
              
              <Link
                to={`/analytics?page=${page.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Analytics"
              >
                <SafeIcon name={undefined}  icon={FiBarChart3} />
              </Link>
              
              <Link
                to={`/builder?page=${page.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit"
              >
                <SafeIcon name={undefined}  icon={FiEdit3} />
              </Link>
              
              <a
                href={`#/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="View Live"
              >
                <SafeIcon name={undefined}  icon={FiExternalLink} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  const filteredPages = getFilteredPages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-tour-id="page-manager-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Pages</h1>
              <p className="text-gray-600">{pages.length} pages total</p>
            </div>
            <Link
              to="/builder?new=true"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              data-tour-id="create-page-button"
            >
              <SafeIcon name={undefined}  icon={FiPlus} />
              Create New Page
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Bulk Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Pages</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {pages.length > 0 && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            )}
          </div>

          <AnimatePresence>
            {showBulkActions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-gray-600">
                  {selectedPages.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pages Grid */}
        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon name={undefined}  icon={FiPlus} className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? "You haven't created any pages yet"
                : `No ${filterStatus} pages found`
              }
            </p>
            <Link
              to="/builder?new=true"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiPlus} />
              Create Your First Page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManager;