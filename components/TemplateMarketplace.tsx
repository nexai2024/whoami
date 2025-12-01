"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import SafeIcon from '@/common/SafeIcon';
import BlockRenderer from './BlockRenderer';
const {
  FiSearch, FiX, FiEye, FiDownload, FiGrid, FiFilter, FiStar,
  FiTrendingUp, FiZap, FiLayout, FiFileText, FiChevronDown,
  FiShoppingBag, FiUsers, FiBriefcase, FiMusic, FiCamera,
  FiCode, FiHeart, FiBook, FiCoffee, FiDroplet, FiUser
} = FiIcons;

interface TemplateMarketplaceProps {
  onApply?: (templateId: string) => void;
  pageId?: string;
  userId?: string;
  showAIGenerate?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  tags: string[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  thumbnailUrl: string;
  useCount: number;
  rating?: number;
  featured: boolean;
  createdAt: string;
  theme?: any;
}

const templateCategories = [
  { id: 'all', label: 'All Templates', icon: FiGrid, color: 'gray' },
  { id: 'personal', label: 'Personal Brand', icon: FiUsers, color: 'blue' },
  { id: 'business', label: 'Business', icon: FiBriefcase, color: 'indigo' },
  { id: 'creative', label: 'Creative', icon: FiDroplet, color: 'purple' },
  { id: 'music', label: 'Music', icon: FiMusic, color: 'pink' },
  { id: 'photography', label: 'Photography', icon: FiCamera, color: 'red' },
  { id: 'tech', label: 'Tech', icon: FiCode, color: 'green' },
  { id: 'lifestyle', label: 'Lifestyle', icon: FiHeart, color: 'rose' },
  { id: 'education', label: 'Education', icon: FiBook, color: 'yellow' },
  { id: 'food', label: 'Food & Drink', icon: FiCoffee, color: 'orange' },
];

const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onApply,
  pageId,
  userId,
  showAIGenerate = true,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      // Add userId header if available for better filtering
      const headers: HeadersInit = {};
      if (userId) {
        headers['x-user-id'] = userId;
      }

      const response = await fetch(`/api/templates/pages?${params.toString()}`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const fetchedTemplates = data.templates || [];
        setTemplates(fetchedTemplates);
        
        if (fetchedTemplates.length === 0) {
          console.log('No templates found. This might be expected if no templates have been created yet.');
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load templates' }));
        toast.error(error.error || 'Failed to load templates');
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.useCount - a.useCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    // Featured first
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    setFilteredTemplates(filtered);
  };

  const handlePreview = async (template: Template) => {
    setPreviewTemplate(template);
    setLoadingPreview(true);
    setPreviewData(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (userId) {
        headers['x-user-id'] = userId;
      }

      const response = await fetch(`/api/templates/pages/${template.id}/preview`, {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        // API returns { preview: { id, name, templateType, header, blocks } }
        // Normalize to match what we expect
        if (data.preview) {
          setPreviewData({ preview: data.preview });
        } else {
          setPreviewData(data);
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to load preview' }));
        toast.error(error.error || 'Failed to load preview');
        setPreviewData(null);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApply = async (template: Template) => {
    if (!pageId) {
      toast.error('No page selected');
      return;
    }

    if (!userId) {
      toast.error('Please sign in to apply templates');
      return;
    }

    setApplying(true);
    try {
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'x-user-id': userId,
      };

      const response = await fetch(`/api/templates/pages/${template.id}/use`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ pageId }),
      });

      if (response.ok) {
        toast.success(`Template "${template.name}" applied successfully!`);
        if (onApply) {
          onApply(template.id);
        }
        setPreviewTemplate(null);
        // Reload page or refresh data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to apply template' }));
        toast.error(error.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setApplying(false);
    }
  };

  const selectedCategoryData = templateCategories.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SafeIcon name={undefined} icon={FiShoppingBag} />
            Template Marketplace
          </h2>
          <p className="text-gray-600 mt-1">
            Professional templates designed by experts. One-click setup.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <SafeIcon name={undefined} icon={FiGrid} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <SafeIcon name={undefined} icon={FiFileText} />
            </button>
          </div>

          {showAIGenerate && (
            <button
              onClick={() => {
                // Open AI generate modal (could be integrated)
                toast('AI Template Generator coming soon!');
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <SafeIcon name={undefined} icon={FiZap} />
              Generate with AI
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {templateCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? `bg-${category.color}-600 text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon name={undefined} icon={Icon} />
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SafeIcon name={undefined} icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <SafeIcon name={undefined} icon={FiFileText} className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex gap-4' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'} h-48 bg-gradient-to-br from-indigo-100 to-purple-100`}>
                {template.thumbnailUrl ? (
                  <Image
                    src={template.thumbnailUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SafeIcon name={undefined} icon={FiLayout} className="text-4xl text-gray-400" />
                  </div>
                )}
                {template.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <SafeIcon name={undefined} icon={FiStar} />
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handlePreview(template)}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                  >
                    <SafeIcon name={undefined} icon={FiEye} />
                    Preview
                  </button>
                  {pageId && userId && (
                    <button
                      onClick={() => handleApply(template)}
                      disabled={applying}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <SafeIcon name={undefined} icon={FiDownload} />
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <SafeIcon name={undefined} icon={FiStar} className="text-sm" />
                      <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <SafeIcon name={undefined} icon={FiTrendingUp} />
                      {template.useCount} uses
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  {pageId && userId && (
                    <button
                      onClick={() => handleApply(template)}
                      disabled={applying}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                    >
                      <SafeIcon name={undefined} icon={FiDownload} />
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <SafeIcon name={undefined} icon={FiX} />
                </button>
              </div>
              <div className="p-6">
                {loadingPreview ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading preview...</p>
                  </div>
                ) : previewData ? (
                  <div className="space-y-6">
                    {/* Template Info Banner */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-1">{previewTemplate.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{previewTemplate.description}</p>
                      {previewData.preview && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: <span className="font-medium text-gray-700">{previewData.preview.templateType}</span></span>
                          {previewData.preview.blocks && Array.isArray(previewData.preview.blocks) && (
                            <span>Blocks: <span className="font-medium text-gray-700">{previewData.preview.blocks.length}</span></span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live Preview Container */}
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-4">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Header Preview */}
                        {previewData.preview?.header && (() => {
                          const header = previewData.preview.header;
                          const headerStyle = header.headerStyle || 'minimal';
                          const isGradient = headerStyle === 'gradient';
                          const isSplit = headerStyle === 'split';
                          
                          return (
                            <div className={`${
                              isGradient 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                                : isSplit
                                ? 'bg-white border-b'
                                : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                            } p-6 ${isSplit ? 'flex flex-col md:flex-row gap-4 items-center' : 'text-center'}`}>
                              {/* Avatar */}
                              <div className={`${
                                isSplit ? 'w-16 h-16 flex-shrink-0' : 'w-20 h-20 mx-auto mb-4'
                              } rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center`}>
                                {header.avatar ? (
                                  <Image
                                    src={header.avatar}
                                    alt={header.displayName || 'Avatar'}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className={`${isGradient ? 'text-white' : 'text-white'} text-xl font-bold`}>
                                    {(header.displayName || 'U').charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              
                              {/* Header Content */}
                              <div className={isSplit ? 'flex-1' : ''}>
                                {header.displayName && (
                                  <h2 className={`text-xl font-bold mb-1 ${isGradient ? 'text-white' : 'text-gray-900'}`}>
                                    {header.displayName}
                                  </h2>
                                )}
                                {header.title && (
                                  <p className={`text-sm mb-2 ${isGradient ? 'text-white/90' : 'text-gray-700'}`}>
                                    {header.title}
                                  </p>
                                )}
                                {header.bio && (
                                  <p className={`text-xs ${isGradient ? 'text-white/80' : 'text-gray-600'} max-w-md ${isSplit ? 'mx-0' : 'mx-auto'}`}>
                                    {header.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Blocks Preview - Rendered with BlockRenderer */}
                        {previewData.preview?.blocks && Array.isArray(previewData.preview.blocks) && previewData.preview.blocks.length > 0 && (
                          <div className="p-4 space-y-3">
                            {previewData.preview.blocks.map((block: any, index: number) => {
                              // Ensure block has required fields for BlockRenderer
                              const previewBlock = {
                                ...block,
                                id: block.id || `preview-${index}`,
                                type: block.type?.toUpperCase() || block.type,
                                position: block.position || index,
                                isActive: true,
                              };
                              
                              return (
                                <div key={index} className="preview-block">
                                  <BlockRenderer
                                    block={previewBlock}
                                    onBlockClick={() => {
                                      // Preview mode - no action
                                      console.log('Preview block clicked:', previewBlock);
                                    }}
                                    themeColors={{
                                      primary: '#6366F1',
                                      secondary: '#8B5CF6',
                                      accent: '#EC4899',
                                      background: '#FFFFFF',
                                      surface: '#F9FAFB',
                                      text: '#111827',
                                      border: '#E5E7EB',
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {previewData.preview?.templateType === 'BIO_ONLY' && (!previewData.preview.blocks || previewData.preview.blocks.length === 0) && (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            <SafeIcon name={undefined} icon={FiUser} className="text-3xl mx-auto mb-2 text-gray-400" />
                            <p>Bio Only Template</p>
                            <p className="text-xs mt-1">This template includes header only</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="sticky bottom-0 bg-white pt-4 border-t">
                      {pageId && userId ? (
                        <button
                          onClick={() => handleApply(previewTemplate)}
                          disabled={applying}
                          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <SafeIcon name={undefined} icon={FiDownload} />
                          {applying ? 'Applying...' : 'Apply This Template'}
                        </button>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 text-center">
                          {!pageId ? 'Please create or select a page first' : 'Please sign in to apply templates'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    <SafeIcon name={undefined} icon={FiFileText} className="text-4xl mx-auto mb-4 text-gray-400" />
                    <p>Preview not available</p>
                    <p className="text-sm mt-2">This template may not have preview data configured.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateMarketplace;

