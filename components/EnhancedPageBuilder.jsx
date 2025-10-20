"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import * as FiIcons from 'react-icons/fi';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageService } from '../lib/database/pages';
import { AnalyticsService } from '../lib/database/analytics';
import { logger } from '../lib/utils/logger';
import SEOHead from './SEOHead';
import SafeIcon from '../common/SafeIcon';
import HeaderCustomizer from './HeaderCustomizer';
import { useAuth } from '../lib/auth/AuthContext.jsx';
import BlockFormFields from './BlockFormFields';

const { 
  FiPlus, FiMove, FiEdit3, FiTrash2, FiSave, FiEye, FiImage, 
  FiLink, FiShoppingBag, FiMail, FiMusic, FiVideo, FiCalendar,
  FiUser, FiSettings, FiTag, FiShare2
} = FiIcons;

// SortableBlock component for drag-and-drop functionality
const SortableBlock = ({ block, selectedBlock, setSelectedBlock, deleteBlock, getBlockIcon, renderBlockSummary }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
          selectedBlock?.id === block.id
            ? 'border-indigo-500 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedBlock(block)}
        whileHover={{ scale: isDragging ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <SafeIcon icon={getBlockIcon(block.type)} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{block.title}</h3>
            {renderBlockSummary(block)}
          </div>
          <div className="flex items-center gap-2">
            <div
              {...listeners}
              {...attributes}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
            >
              <SafeIcon icon={FiIcons.FiMove} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <SafeIcon icon={FiIcons.FiTrash2} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EnhancedPageBuilder = () => {
  const searchParams = useSearchParams();
  const { currUser } = useAuth();
  const [activeTab, setActiveTab] = useState('header');
  const [user , setUser] = useState(null);
  const [blocks, setBlocks] = useState([]);
  
  // Setup sensors for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Fetch blocks for the page from backend
  useEffect(() => {
    const pageId = searchParams.get('page');
    if (!pageId) return;
    async function fetchBlocks() {
      try {
        const res = await fetch(`/api/pages/${pageId}/blocks`);
        if (res.ok) {
          const data = await res.json();
          setBlocks(data);
        }
      } catch (err) {
        console.error('Failed to fetch blocks:', err);
      }
    }
    fetchBlocks();
  }, [searchParams]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const tabs = [
    { id: 'header', label: 'Header', icon: FiUser },
    { id: 'blocks', label: 'Content Blocks', icon: FiLink },
    { id: 'settings', label: 'Page Settings', icon: FiSettings }
  ];

  const blockTypes = [
    { type: 'link', label: 'Link', icon: FiLink, color: 'blue' },
    { type: 'product', label: 'Product', icon: FiShoppingBag, color: 'green' },
    { type: 'email', label: 'Email Capture', icon: FiMail, color: 'purple' },
    { type: 'image', label: 'Image Gallery', icon: FiImage, color: 'pink' },
    { type: 'music', label: 'Music Player', icon: FiMusic, color: 'orange' },
    { type: 'video', label: 'Video Embed', icon: FiVideo, color: 'red' },
    { type: 'booking', label: 'Booking', icon: FiCalendar, color: 'indigo' },
    { type: 'analytics', label: 'Analytics', icon: FiEye, color: 'teal' },
    { type: 'promo', label: 'Promo', icon: FiTag, color: 'yellow' },
    { type: 'discount', label: 'Discount', icon: FiTag, color: 'amber' },
    { type: 'social_share', label: 'Social Share', icon: FiShare2, color: 'cyan' },
    { type: 'waitlist', label: 'Waitlist', icon: FiMail, color: 'lime' },
    { type: 'newsletter', label: 'Newsletter', icon: FiMail, color: 'rose' },
    { type: 'tip', label: 'Tip Jar', icon: FiTag, color: 'emerald' },
    { type: 'social_feed', label: 'Social Feed', icon: FiShare2, color: 'sky' },
    { type: 'ama', label: 'Ask Me Anything', icon: FiMail, color: 'violet' },
    { type: 'gated', label: 'Gated Content', icon: FiSettings, color: 'fuchsia' },
    { type: 'rss', label: 'RSS Feed', icon: FiLink, color: 'orange' },
    { type: 'portfolio', label: 'Portfolio', icon: FiImage, color: 'slate' },
    { type: 'contact', label: 'Contact Form', icon: FiMail, color: 'zinc' },
    { type: 'divider', label: 'Divider', icon: FiEdit3, color: 'stone' },
    { type: 'text', label: 'Text Block', icon: FiEdit3, color: 'neutral' },
    { type: 'custom', label: 'Custom', icon: FiEdit3, color: 'gray' }
  ];

  // Set user from currUser when it becomes available
  useEffect(() => {
    if (currUser) {
      setUser(currUser);
      console.log("Current user in page builder:", currUser);
    }
  }, [currUser]);

  const pageId = searchParams.get('page');
  const isNew = searchParams.get('new');

  // Initialize or load page data - fixed to prevent duplicate creation
  useEffect(() => {
    if (pageId) {
      loadPageData(pageId);
    } else if (isNew && !pageData?.id && user?.id) {
      // Initialize new page only if we don't already have one
      console.log("Initializing new page");
      const newPage = PageService.createPage({ userID: user.id });
      if (newPage.id) {
        console.log("New page created:", newPage);
        setPageData({
          id: newPage.id,
          title: newPage.title,
          description: newPage.description,
          headerData: {
            displayName: '',
            title: '',
            company: '',
            bio: '',
            email: '',
            phone: '',
            website: '',
            location: '',
            customIntroduction: '',
            headerStyle: 'minimal'
          }
        });
      }
    }
  }, [pageId, isNew, user?.id, pageData?.id]);

  const loadPageData = async (pageId) => {
    try {
      setLoading(true);
      const data = await PageService.getPageById(pageId);
      setPageData(data);
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      data: {},
    };
    
    // Provide sensible defaults for all block types
    switch (type) {
      case 'product':
        newBlock.data = { price: 0, currency: 'USD', stockStatus: 'in_stock' };
        break;
      case 'link':
        newBlock.data = { url: '', openInNewTab: true };
        break;
      case 'email':
      case 'newsletter':
      case 'waitlist':
        newBlock.data = { description: 'Subscribe for updates', buttonText: 'Subscribe' };
        break;
      case 'promo':
        newBlock.data = { promoCode: '', showCopyButton: true };
        break;
      case 'discount':
        newBlock.data = { discountPercentage: 0, codeRequired: false };
        break;
      case 'analytics':
        newBlock.data = { provider: 'google' };
        break;
      case 'image':
        newBlock.data = { images: [], layout: 'grid', clickBehavior: 'lightbox' };
        break;
      case 'music':
        newBlock.data = { trackTitle: '', audioUrl: '' };
        break;
      case 'video':
        newBlock.data = { videoUrl: '', platform: 'youtube', showControls: true };
        break;
      case 'booking':
        newBlock.data = { duration: 30, calendarIntegration: 'calendly' };
        break;
      case 'tip':
        newBlock.data = { suggestedAmounts: [5, 10, 20], currency: 'USD', allowCustomAmount: true };
        break;
      case 'social_feed':
        newBlock.data = { platform: 'instagram', layout: 'grid', itemCount: 9 };
        break;
      case 'social_share':
        newBlock.data = { platforms: { facebook: true, twitter: true }, buttonStyle: 'icons' };
        break;
      case 'ama':
        newBlock.data = { questionFormTitle: 'Ask Me Anything', answerFormat: 'text' };
        break;
      case 'contact':
        newBlock.data = { submitButtonText: 'Send Message', enableCaptcha: true };
        break;
      case 'text':
        newBlock.data = { content: '', headingLevel: 'p', textAlign: 'left', fontSize: 'medium' };
        break;
      case 'divider':
        newBlock.data = { style: 'solid', thickness: 1, width: 100, color: '#E5E7EB' };
        break;
      case 'portfolio':
        newBlock.data = { projectTitle: '', images: [], featured: false };
        break;
      case 'rss':
        newBlock.data = { feedUrl: '', itemCount: 10, layout: 'list' };
        break;
      case 'gated':
        newBlock.data = { contentType: 'file', accessRequirement: 'email' };
        break;
      case 'custom':
        newBlock.data = { allowScripts: false };
        break;
    }
    
    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  // Helper function to update block data fields
  const updateBlockData = (field, value) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === selectedBlock.id) {
        // Handle nested fields (e.g., 'platforms.facebook')
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...block,
            data: {
              ...block.data,
              [parent]: {
                ...(block.data?.[parent] || {}),
                [child]: value
              }
            }
          };
        }
        // Handle regular fields
        return {
          ...block,
          data: { ...block.data, [field]: value }
        };
      }
      return block;
    });
    
    setBlocks(updatedBlocks);
    
    // Update selected block
    const updatedSelected = updatedBlocks.find(b => b.id === selectedBlock.id);
    setSelectedBlock(updatedSelected);
  };

  // Handle drag and drop reordering with @dnd-kit
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Dropped outside or on itself
    if (!over || active.id === over.id) return;

    // Find the indices of the dragged and drop target blocks
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder blocks locally (optimistic update)
    const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);

    // Update local state immediately
    setBlocks(reorderedBlocks);

    // Update position values for all blocks
    const updatedBlocks = reorderedBlocks.map((block, index) => ({
      id: block.id,
      position: index
    }));

    // Persist to database
    const pageId = searchParams.get('page');
    if (!pageId) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: updatedBlocks }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Reorder failed:', error);
      // Revert to original order on error
      const pageIdRetry = searchParams.get('page');
      if (pageIdRetry) {
        // Refetch original blocks
        const res = await fetch(`/api/pages/${pageIdRetry}/blocks`);
        if (res.ok) {
          const data = await res.json();
          setBlocks(data);
        }
      }
    }
  };

  const handleHeaderSave = (headerData) => {
    setPageData(prev => ({
      ...prev,
      headerData
    }));
  };

  // Save blocks to backend
  const handleSaveBlocks = async () => {
    const pageId = searchParams.get('page');
    if (!pageId) return;
    try {
      const res = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blocks),
      });
      if (res.ok) {
        // Optionally show a success message
        // const saved = await res.json();
      } else {
        alert('Failed to save blocks');
      }
    } catch (err) {
      alert('Failed to save blocks');
    }
  };

  const handlePreview = () => {
    if (pageData && pageData.slug) {
      // Open the public page in a new tab
      window.open(`/#/${pageData.slug}`, '_blank', 'noopener,noreferrer');
    } else {
      alert('Page preview is only available after saving the page with a valid slug.');
    }
  };

  // Helper function to get block icon
  const getBlockIcon = (type) => {
    const iconMap = {
      link: FiLink,
      product: FiShoppingBag,
      email: FiMail,
      image: FiImage,
      music: FiMusic,
      video: FiVideo,
      booking: FiCalendar,
      analytics: FiEye,
      promo: FiTag,
      discount: FiTag,
      social_share: FiShare2,
      waitlist: FiMail,
      newsletter: FiMail,
      custom: FiEdit3,
      tip: FiTag,
      social_feed: FiShare2,
      ama: FiMail,
      gated: FiSettings,
      rss: FiLink,
      portfolio: FiImage,
      contact: FiMail,
      divider: FiEdit3,
      text: FiEdit3
    };
    return iconMap[type] || FiLink;
  };

  // Helper function to render block summary
  const renderBlockSummary = (block) => {
    switch (block.type) {
      case 'product':
        return <p className="text-sm text-green-600 font-medium">${block.data?.price || '0'}</p>;
      case 'link':
        return <p className="text-sm text-blue-600 truncate">{block.data?.url || 'No URL'}</p>;
      case 'email':
      case 'newsletter':
      case 'waitlist':
        return <p className="text-sm text-gray-600">{block.data?.description || 'Email capture'}</p>;
      case 'promo':
        return <p className="text-sm text-yellow-600">Code: {block.data?.promoCode || 'N/A'}</p>;
      case 'discount':
        return <p className="text-sm text-amber-600">{block.data?.discountPercentage || block.data?.discount || 0}% off</p>;
      case 'analytics':
        return <p className="text-sm text-teal-600">{block.data?.provider || block.data?.source || 'Analytics'}</p>;
      case 'music':
        return <p className="text-sm text-orange-600">{block.data?.trackTitle || 'Music track'}</p>;
      case 'video':
        return <p className="text-sm text-red-600">{block.data?.platform || 'Video'}</p>;
      case 'booking':
        return <p className="text-sm text-indigo-600">{block.data?.serviceType || 'Booking'}</p>;
      case 'tip':
        return <p className="text-sm text-emerald-600">Tip Jar - {block.data?.currency || 'USD'}</p>;
      case 'social_feed':
        return <p className="text-sm text-sky-600">{block.data?.platform || 'Social'} - @{block.data?.username || 'user'}</p>;
      case 'ama':
        return <p className="text-sm text-violet-600">Q&A Block</p>;
      case 'gated':
        return <p className="text-sm text-fuchsia-600">{block.data?.accessRequirement || 'Gated'} access</p>;
      case 'rss':
        return <p className="text-sm text-orange-600 truncate">{block.data?.feedUrl || 'RSS Feed'}</p>;
      case 'portfolio':
        return <p className="text-sm text-slate-600">{block.data?.projectTitle || 'Portfolio item'}</p>;
      case 'contact':
        return <p className="text-sm text-zinc-600">Contact Form</p>;
      case 'text':
        return <p className="text-sm text-neutral-600">{block.data?.headingLevel || 'Text'}</p>;
      case 'divider':
        return <p className="text-sm text-stone-600">{block.data?.style || 'solid'} line</p>;
      case 'image':
        const imgCount = block.data?.images?.length || 0;
        return <p className="text-sm text-pink-600">{imgCount} image{imgCount !== 1 ? 's' : ''}</p>;
      case 'social_share':
        return <p className="text-sm text-cyan-600">Share buttons</p>;
      case 'custom':
        return <p className="text-sm text-gray-600">Custom HTML/JS</p>;
      default:
        return null;
    }
  };

  const BlockPreview = ({ block }) => {
    return (
      <motion.div
        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
          selectedBlock?.id === block.id
            ? 'border-indigo-500 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedBlock(block)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <SafeIcon icon={getBlockIcon(block.type)} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{block.title}</h3>
            {renderBlockSummary(block)}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon={FiMove} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <SafeIcon icon={FiTrash2} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderHeaderTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Header Customization</h3>
        <p className="text-sm text-blue-800">
          Customize your page header with personal information, contact details, and social links.
          This is the first thing visitors see when they visit your page.
        </p>
      </div>
      
      {pageData && (
        <HeaderCustomizer
          pageId={pageData.id}
          currentHeader={pageData.headerData || {}}
          onSave={handleHeaderSave}
          onPreview={handlePreview}
        />
      )}
    </div>
  );

  const renderBlocksTab = () => (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Block Library */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Blocks</h2>
          <div className="space-y-3">
            {blockTypes.map((blockType, index) => (
              <button
                key={index}
                onClick={() => addBlock(blockType.type)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-${blockType.color}-300 hover:bg-${blockType.color}-50 transition-colors group`}
              >
                <SafeIcon icon={blockType.icon} className={`text-${blockType.color}-600`} />
                <span className="text-gray-700 group-hover:text-gray-900">{blockType.label}</span>
                <SafeIcon icon={FiPlus} className="ml-auto text-gray-400 group-hover:text-gray-600" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Canvas */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Content Blocks</h2>
            <p className="text-gray-600">Drag and drop blocks to rearrange them</p>
          </div>

          {/* Blocks with Drag-Drop using @dnd-kit */}
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={blocks.map(b => b.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    selectedBlock={selectedBlock}
                    setSelectedBlock={setSelectedBlock}
                    deleteBlock={deleteBlock}
                    getBlockIcon={getBlockIcon}
                    renderBlockSummary={renderBlockSummary}
                  />
                ))}
                {blocks.length === 0 && (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiPlus} className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-600">Add your first block to get started</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Block Editor */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
          {selectedBlock ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Block</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={(e) => {
                      const updatedBlocks = blocks.map(block =>
                        block.id === selectedBlock.id ? { ...block, title: e.target.value } : block
                      );
                      setBlocks(updatedBlocks);
                      setSelectedBlock({ ...selectedBlock, title: e.target.value });
                    }}
                  />
                </div>
                
                {/* Comprehensive block-specific form fields */}
                <BlockFormFields 
                  selectedBlock={selectedBlock} 
                  updateBlockData={updateBlockData}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <SafeIcon icon={FiEdit3} className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Select a block to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Page Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
          <input
            type="text"
            value={pageData?.title || ''}
            onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Page URL</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              localhost:3000/
            </span>
            <input
              type="text"
              placeholder="your-username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Page Description</label>
          <textarea
            value={pageData?.description || ''}
            onChange={(e) => setPageData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Describe your page for search engines..."
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {pageData?.title || 'Page Builder'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <SafeIcon icon={FiEye} />
                Preview
              </button>
              <button
                onClick={handleSaveBlocks}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <SafeIcon icon={FiSave} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'header' && renderHeaderTab()}
        {activeTab === 'blocks' && renderBlocksTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default EnhancedPageBuilder;