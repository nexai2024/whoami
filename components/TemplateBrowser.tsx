"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const {
  FiSearch, FiX, FiEye, FiDownload, FiGrid, FiFilter, FiStar,
  FiTrendingUp, FiZap, FiLayout, FiFileText, FiChevronDown
} = FiIcons;

interface TemplateBrowserProps {
  templateType?: 'BIO_ONLY' | 'FULL_PAGE' | 'ALL';
  onApply?: (templateId: string) => void;
  pageId?: string;
  showAIGenerate?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  thumbnailUrl: string;
  useCount: number;
  featured: boolean;
  createdAt: string;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  templateType = 'ALL',
  onApply,
  pageId,
  showAIGenerate = true
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [applying, setApplying] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, [templateType]);

  // Filter templates
  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedTags, templateType]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        featured: 'true',
        limit: '50'
      });

      if (templateType !== 'ALL') {
        params.append('templateType', templateType);
      }

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
    let filtered = [...templates];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t =>
        selectedTags.every(tag => t.tags.includes(tag))
      );
    }

    // Sort: featured first, then by use count
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return b.useCount - a.useCount;
    });

    setFilteredTemplates(filtered);
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

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const categories = [
    'all',
    ...Array.from(new Set(templates.map(t => t.category)))
  ];

  const allTags = Array.from(new Set(templates.flatMap(t => t.tags)));

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
                      onClick={() => setSelectedCategory(category)}
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </p>
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
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
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
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiEye />
                    Preview
                  </button>
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
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                  <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
              <div className="p-6">
                <img
                  src={previewTemplate.thumbnailUrl}
                  alt={previewTemplate.name}
                  className="w-full rounded-lg"
                />
                {pageId && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        handleApplyTemplate(previewTemplate);
                        setPreviewTemplate(null);
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
