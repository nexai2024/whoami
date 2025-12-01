"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import BlockRenderer from './BlockRenderer';
import Image from 'next/image';
const {
  FiSearch, FiX, FiEye, FiDownload, FiGrid, FiFilter, FiStar,
  FiTrendingUp, FiZap, FiLayout, FiFileText, FiChevronDown
} = FiIcons;

interface TemplateBrowserProps {
  templateType?: 'BIO_ONLY' | 'FULL_PAGE' | 'ALL';
  onApply?: (templateId: string) => void;
  pageId?: string;
  showAIGenerate?: boolean;
  refreshKey?: number;
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
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  templateType = 'ALL',
  onApply,
  pageId,
  showAIGenerate = true,
  refreshKey = 0
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Fetch templates when filters change
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType, selectedCategory, selectedIndustry, selectedTags, sortBy, refreshKey]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Filter templates
  useEffect(() => {
    filterTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, searchQuery, selectedCategory, selectedIndustry, selectedTags, sortBy, templateType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100' // Increased to get more templates for filtering
      });

      if (templateType !== 'ALL') {
        params.append('templateType', templateType);
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (selectedIndustry !== 'all') {
        params.append('industry', selectedIndustry);
      }

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      params.append('sortBy', sortBy);

      const response = await fetch(`/api/templates/pages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    // Templates are already filtered and sorted by the API
    // Just set them directly
    setFilteredTemplates(templates);
  };

  const handleApplyTemplate = async (template: Template) => {
    if (!pageId) {
      toast.error('No page selected');
      return;
    }

    if (!confirm(`Apply "${template.name}" template? This will replace your current ${template.templateType === 'BIO_ONLY' ? 'bio' : 'page content'}.`)) {
      return;
    }

    try {
      setApplying(true);
      const response = await fetch(`/api/templates/pages/${template.id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user' // Replace with actual auth
        },
        body: JSON.stringify({ pageId })
      });

      if (response.ok) {
        toast.success('Template applied successfully!');
        if (onApply) {
          onApply(template.id);
        }
        // Refresh page to show new content
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setApplying(false);
    }
  };

  const handlePreview = async (template: Template) => {
    setPreviewTemplate(template);
    setLoadingPreview(true);
    setPreviewData(null);
    
    try {
      const response = await fetch(`/api/templates/pages/${template.id}/preview`, {
        headers: {
          'x-user-id': 'demo-user'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
      } else {
        toast.error('Failed to load template preview');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load template preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const categories = [
    'all',
    ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))
  ];

  const industries = [
    'all',
    ...Array.from(new Set(templates.map(t => t.industry).filter(Boolean)))
  ];

  const allTags = Array.from(new Set(templates.flatMap(t => t.tags).filter(Boolean)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Generate */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
          <p className="text-gray-600 mt-1">
            Choose from professionally designed templates
          </p>
        </div>

        {showAIGenerate && (
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <FiZap className="text-lg" />
            Generate with AI
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <FiFilter />
          <span className="font-medium">Filters</span>
          <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4"
            >
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedIndustry('all'); // Reset industry when category changes
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry Filter */}
              {industries.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map(industry => (
                      <button
                        key={industry}
                        onClick={() => setSelectedIndustry(industry ?? 'all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedIndustry === industry
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {(industry ?? '')
                          .charAt(0)
                          .toUpperCase() + (industry ?? '').slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'rating')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FiGrid className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                <Image 
                  src={template.thumbnailUrl}
                  alt={template.name}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {template.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <FiStar className="text-sm" />
                    Featured
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {template.templateType === 'BIO_ONLY' ? 'Bio Only' : 'Full Page'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    {template.category}
                  </span>
                  {template.industry && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {template.industry}
                    </span>
                  )}
                  {template.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <FiTrendingUp />
                    <span>{template.useCount} uses</span>
                  </div>
                  {template.rating !== undefined && template.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-500 fill-yellow-500" />
                      <span>{template.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`/templates/${template.id}/preview${pageId ? `?pageId=${pageId}` : ''}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiEye />
                    Preview
                  </a>
                  {pageId && (
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      disabled={applying}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <FiDownload />
                      Use
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
            onClick={() => {
              setPreviewTemplate(null);
              setPreviewData(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                  <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    setPreviewData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
              
              <div className="p-6">
                {loadingPreview ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : previewData ? (
                  <div className="space-y-6">
                    {/* Header Preview */}
                    {previewData.header && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                        <div className="text-center">
                          {previewData.header.displayName && (
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                              {previewData.header.displayName}
                            </h2>
                          )}
                          {previewData.header.title && (
                            <p className="text-lg text-gray-700 mb-2">{previewData.header.title}</p>
                          )}
                          {previewData.header.company && (
                            <p className="text-sm text-gray-600 mb-3">{previewData.header.company}</p>
                          )}
                          {previewData.header.bio && (
                            <p className="text-gray-700 max-w-2xl mx-auto mb-4">{previewData.header.bio}</p>
                          )}
                          {previewData.header.customIntroduction && (
                            <p className="text-sm text-indigo-700 font-medium">
                              {previewData.header.customIntroduction}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Blocks Preview */}
                    {previewData.blocks && previewData.blocks.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Content Blocks</h4>
                        {previewData.blocks.map((block: any, index: number) => (
                          <BlockRenderer
                            key={index}
                            block={block}
                            onBlockClick={() => {}}
                            themeColors={previewData.themeColors}
                          />  
                        ))}
                      </div>
                    )}
                    
                    {previewData.templateType === 'BIO_ONLY' && (!previewData.blocks || previewData.blocks.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        This is a Bio Only template with no content blocks
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Failed to load preview
                  </div>
                )}
                
                {pageId && !loadingPreview && (
                  <div className="mt-6 flex gap-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        handleApplyTemplate(previewTemplate);
                        setPreviewTemplate(null);
                        setPreviewData(null);
                      }}
                      disabled={applying}
                      className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      Use This Template
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIModal && (
          <AIGenerateModal
            templateType={templateType !== 'ALL' ? templateType : undefined}
            pageId={pageId}
            onClose={() => setShowAIModal(false)}
            onGenerated={() => {
              setShowAIModal(false);
              fetchTemplates();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Generate Modal Component
const AIGenerateModal: React.FC<{
  templateType?: 'BIO_ONLY' | 'FULL_PAGE';
  pageId?: string;
  onClose: () => void;
  onGenerated: () => void;
}> = ({ templateType, pageId, onClose, onGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'BIO_ONLY' | 'FULL_PAGE'>(templateType || 'FULL_PAGE');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/templates/pages/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user' // Replace with actual auth
        },
        body: JSON.stringify({
          prompt,
          templateType: selectedType,
          saveAsTemplate: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Template generated successfully!');
        onGenerated();

        // If pageId provided, optionally apply the template
        if (pageId && data.savedTemplate) {
          const apply = confirm('Apply this template to your page now?');
          if (apply) {
            const applyResponse = await fetch(`/api/templates/pages/${data.savedTemplate.id}/use`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': 'demo-user'
              },
              body: JSON.stringify({ pageId })
            });

            if (applyResponse.ok) {
              toast.success('Template applied!');
              window.location.reload();
            }
          }
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg max-w-2xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Generate with AI</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Template Type Selection */}
          {!templateType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedType('BIO_ONLY')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedType === 'BIO_ONLY'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FiFileText className="text-2xl mb-2 mx-auto" />
                  <div className="font-medium">Bio Only</div>
                  <div className="text-xs text-gray-600">Header and profile</div>
                </button>
                <button
                  onClick={() => setSelectedType('FULL_PAGE')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedType === 'FULL_PAGE'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FiLayout className="text-2xl mb-2 mx-auto" />
                  <div className="font-medium">Full Page</div>
                  <div className="text-xs text-gray-600">With content blocks</div>
                </button>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your page
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="E.g., A personal portfolio for a freelance web developer showcasing projects and skills with a modern, professional design"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <FiZap />
                Generate Template
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemplateBrowser;
