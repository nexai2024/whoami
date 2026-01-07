"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import BlockRenderer from './BlockRenderer';
import HeaderCustomizer from './HeaderCustomizer';
import ThemeSelector from './ThemeSelector';
import { FiDroplet } from 'react-icons/fi';

const {
  FiEye,
  FiSave,
  FiX,
  FiRefreshCw,
  FiLayout,
  FiType,
  FiCode,
  FiCheck
} = FiIcons;

interface TemplateCustomizationStudioProps {
  templateId: string;
  pageId?: string;
  userId?: string;
  onSave?: (customizationId: string) => void;
  onApply?: () => void;
}

const TemplateCustomizationStudio: React.FC<TemplateCustomizationStudioProps> = ({
  templateId,
  pageId,
  userId,
  onSave,
  onApply
}) => {
  const [template, setTemplate] = useState<any>(null);
  const [customizations, setCustomizations] = useState<any>({
    header: {},
    blocks: [],
    theme: null,
    colors: {},
    typography: {}
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'header' | 'blocks' | 'theme' | 'colors' | 'typography'>('preview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/pages/${templateId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTemplate(data.template);
        
        // Initialize customizations from template
        setCustomizations({
          header: data.template.headerData || {},
          blocks: data.template.blocksData || [],
          theme: data.template.theme || null,
          colors: {},
          typography: {}
        });
      } else {
        toast.error('Failed to load template');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('Please sign in to save customizations');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/templates/customizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          templateId,
          pageId,
          customizations,
          previewData: {
            header: customizations.header,
            blocks: customizations.blocks
          },
          saved: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Customizations saved!');
        setHasChanges(false);
        if (onSave) {
          onSave(data.customization.id);
        }
      } else {
        toast.error('Failed to save customizations');
      }
    } catch (error) {
      console.error('Error saving customizations:', error);
      toast.error('Failed to save customizations');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!pageId) {
      toast.error('No page selected');
      return;
    }

    if (!confirm('Apply this customized template to your page? This will replace your current content.')) {
      return;
    }

    try {
      setSaving(true);
      // First save customizations
      await handleSave();
      
      // Then apply to page
      const response = await fetch(`/api/templates/pages/${templateId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'demo-user'
        },
        body: JSON.stringify({
          pageId,
          customizations
        })
      });

      if (response.ok) {
        toast.success('Template applied successfully!');
        if (onApply) {
          onApply();
        }
        window.location.reload();
      } else {
        toast.error('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setSaving(false);
    }
  };

  const updateHeader = (headerData: any) => {
    setCustomizations((prev: { header: any; }) => ({
      ...prev,
      header: { ...prev.header, ...headerData }
    }));
    setHasChanges(true);
  };

  const updateBlock = (index: number, blockData: any) => {
    setCustomizations((prev: { blocks: any[]; }) => ({
      ...prev,
      blocks: prev.blocks.map((block: any, i: number) =>
        i === index ? { ...block, ...blockData } : block
      )
    }));
    setHasChanges(true);
  };

  const updateTheme = (theme: any) => {
    setCustomizations((prev: any) => ({
      ...prev,
      theme
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Template not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customize Template</h2>
          <p className="text-gray-600 mt-1">{template.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 flex items-center gap-1">
              <FiRefreshCw className="text-sm" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FiSave />
            Save
          </button>
          {pageId && (
            <button
              onClick={handleApply}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <FiCheck />
              Apply to Page
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'preview', label: 'Preview', icon: FiEye },
            { id: 'header', label: 'Header', icon: FiLayout },
            { id: 'blocks', label: 'Blocks', icon: FiCode },
            { id: 'theme', label: 'Theme', icon: FiDroplet },
            { id: 'colors', label: 'Colors', icon: FiDroplet },
            { id: 'typography', label: 'Typography', icon: FiType }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview Panel */}
        <div className={`${activeTab === 'preview' ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          {activeTab === 'preview' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Preview Controls */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center gap-2">
                  {['desktop', 'tablet', 'mobile'].map(device => (
                    <button
                      key={device}
                      onClick={() => setPreviewMode(device as any)}
                      className={`px-3 py-1 rounded text-sm ${
                        previewMode === device
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {device.charAt(0).toUpperCase() + device.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Frame */}
              <div
                className={`border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50 ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' :
                  previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
                  'w-full'
                }`}
                style={{
                  height: previewMode === 'mobile' ? '600px' :
                         previewMode === 'tablet' ? '800px' : '900px'
                }}
              >
                <div className="bg-white min-h-full p-6">
                  {/* Header Preview */}
                  {customizations.header && (
                    <div className="mb-6">
                      <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        {customizations.header.displayName && (
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {customizations.header.displayName}
                          </h1>
                        )}
                        {customizations.header.title && (
                          <p className="text-lg text-gray-700 mb-2">{customizations.header.title}</p>
                        )}
                        {customizations.header.bio && (
                          <p className="text-gray-600">{customizations.header.bio}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Blocks Preview */}
                  <div className="space-y-4">
                    {customizations.blocks.map((block: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <BlockRenderer
                          block={{
                            ...block,
                            id: `preview-${index}`
                          }}
                          onBlockClick={() => {}}
                          themeColors={customizations.theme?.colors || {}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Header Customization</h3>
              <HeaderCustomizer
                pageId={pageId || ''}
                currentHeader={customizations.header}
                onSave={updateHeader}
              />
            </div>
          )}

          {activeTab === 'blocks' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Blocks Customization</h3>
              <div className="space-y-4">
                {customizations.blocks.map((block: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{block.title || block.type}</h4>
                      <button
                        onClick={() => {
                          const newBlocks = customizations.blocks.filter((_: any, i: number) => i !== index);
                          setCustomizations((prev: any) => ({ ...prev, blocks: newBlocks }));
                          setHasChanges(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(index, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={block.description || ''}
                          onChange={(e) => updateBlock(index, { description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Theme Selection</h3>
              <ThemeSelector
                selectedThemeId={customizations.theme?.id}
                onThemeSelect={updateTheme}
                showPreview={true}
              />
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Color Customization</h3>
              <p className="text-gray-600">Color customization coming soon</p>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Typography</h3>
              <p className="text-gray-600">Typography customization coming soon</p>
            </div>
          )}
        </div>

        {/* Side Preview (when not in preview tab) */}
        {activeTab !== 'preview' && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
              <div className="border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50" style={{ height: '600px' }}>
                <div className="bg-white min-h-full p-4">
                  {customizations.header && (
                    <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-4">
                      {customizations.header.displayName && (
                        <h2 className="text-xl font-bold text-gray-900">{customizations.header.displayName}</h2>
                      )}
                    </div>
                  )}
                  {customizations.blocks.slice(0, 3).map((block: any, index: number) => (
                    <div key={index} className="mb-3 p-3 border border-gray-200 rounded">
                      <p className="text-sm font-medium">{block.title || block.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCustomizationStudio;






