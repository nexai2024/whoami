"use client";

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  createTemplate,
  type CreateTemplateConfig,
  type BlockConfig
} from '@/lib/templates/templateGenerator';
import {
  getThemeForIndustry,
  templateCategories,
  industriesByCategory
} from '@/lib/templates/designSystem';
import { useAuth } from '@/lib/auth/AuthContext.jsx';

type BuilderBlockType = 'TEXT_BLOCK' | 'LINK';
type HeaderStyleType = 'minimal' | 'card' | 'gradient' | 'split';

interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  title: string;
  description: string;
  url?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface TemplateBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const headerStyles: Array<{ label: string; value: HeaderStyleType }> = [
  { label: 'Minimal', value: 'minimal' },
  { label: 'Card', value: 'card' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Split', value: 'split' }
];

const templateTypes: Array<{ label: string; value: 'BIO_ONLY' | 'FULL_PAGE' }> = [
  { label: 'Bio Only', value: 'BIO_ONLY' },
  { label: 'Full Page', value: 'FULL_PAGE' }
];

const defaultThumbnail = '/templates/custom-template.png';

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(templateCategories[0]);
  const [industry, setIndustry] = useState<string>(industriesByCategory[templateCategories[0]][0]);
  const [templateType, setTemplateType] = useState<'BIO_ONLY' | 'FULL_PAGE'>('FULL_PAGE');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState(defaultThumbnail);
  const [tagsInput, setTagsInput] = useState('creator, featured');

  const [headerStyle, setHeaderStyle] = useState<HeaderStyleType>('gradient');
  const [displayName, setDisplayName] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [customIntro, setCustomIntro] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { currUser } = useAuth();

  const industriesForCategory = useMemo(() => industriesByCategory[category as typeof templateCategories[number]] ?? [], [category]);

  const resetForm = () => {
    setName('');
    setCategory(templateCategories[0]);
    setIndustry(industriesByCategory[templateCategories[0]][0]);
    setTemplateType('FULL_PAGE');
    setDescription('');
    setThumbnailUrl(defaultThumbnail);
    setHeaderStyle('gradient');
    setDisplayName('');
    setHeaderTitle('');
    setCompany('');
    setBio('');
    setCustomIntro('');
    setProfileImageUrl('');
    setCoverImageUrl('');
    setBlocks([]);
    setTagsInput('creator, featured');
  };

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'TEXT_BLOCK',
        title: 'New Block',
        description: '',
        content: '',
        backgroundColor: '#ffffff',
        textColor: '#111827'
      }
    ]);
  };

  const updateBlock = (id: string, data: Partial<BuilderBlock>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...data } : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      if (index === -1) {
        return prev;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];
      const [current] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, current);
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !displayName) {
      toast.error('Name and display name are required.');
      return;
    }

    try {
      setSubmitting(true);

      const blockConfigs: BlockConfig[] =
        templateType === 'BIO_ONLY'
          ? []
          : blocks.map((block, index) => ({
              type: block.type,
              position: index,
              title: block.title,
              description: block.description,
              url: block.url,
              backgroundColor: block.backgroundColor || '#ffffff',
              textColor: block.textColor || '#111827',
              borderRadius: 12,
              data:
                block.type === 'TEXT_BLOCK'
                  ? { content: block.content || '' }
                  : {
                      icon: 'link',
                      featured: false
                    }
            }));

      const config: CreateTemplateConfig = {
        name,
        category,
        industry,
        description,
        templateType,
        thumbnailUrl: thumbnailUrl || defaultThumbnail,
        header: {
          style: headerStyle,
          displayName,
          title: headerTitle,
          company,
          bio,
          customIntroduction: customIntro,
          profileImageUrl: profileImageUrl || undefined,
          coverImageUrl: coverImageUrl || undefined
        },
        blocks: blockConfigs,
        tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
        theme: getThemeForIndustry(industry)
      };

      const template = createTemplate(config);

      const response = await fetch('/api/templates/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currUser?.id ? { 'x-user-id': currUser.id } : {})
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          category: template.category,
          industry: template.industry,
          templateType: template.templateType,
          headerData: template.headerData,
          blocksData: template.blocksData,
          tags: template.tags,
          thumbnailUrl: template.thumbnailUrl,
          previewUrl: template.previewUrl,
          theme: template.theme,
          isPublic: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }

      toast.success('Template created!');
      resetForm();
      onCreated?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Custom Template</h2>
                <p className="text-sm text-gray-500">Define header, theme, and blocks for manual templates.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Basic info */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const nextCategory = e.target.value;
                          setCategory(nextCategory);
                          setIndustry(industriesByCategory[nextCategory as keyof typeof industriesByCategory][0]);
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {templateCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {industriesForCategory.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Type *</label>
                      <select
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as 'BIO_ONLY' | 'FULL_PAGE')}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {templateTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                      <input
                        type="text"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </section>

                {/* Header */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Header</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Header Style</label>
                      <select
                        value={headerStyle}
                        onChange={(e) => setHeaderStyle(e.target.value as HeaderStyleType)}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {headerStyles.map((style) => (
                          <option key={style.value} value={style.value}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Introduction</label>
                        <input
                          type="text"
                          value={customIntro}
                          onChange={(e) => setCustomIntro(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                        <input
                          type="text"
                          value={profileImageUrl}
                          onChange={(e) => setProfileImageUrl(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                        <input
                          type="text"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Blocks */}
                {templateType === 'FULL_PAGE' && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Content Blocks</h3>
                      <button
                        type="button"
                        onClick={addBlock}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                      >
                        <FiPlus />
                        Add Block
                      </button>
                    </div>

                    {blocks.length === 0 && (
                      <p className="text-sm text-gray-500 border rounded-lg px-4 py-6 text-center">No blocks yet. Add blocks to build your full page template.</p>
                    )}

                    <div className="space-y-4">
                      {blocks.map((block, index) => (
                        <div key={block.id} className="border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Block #{index + 1}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'up')}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                disabled={index === 0}
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'down')}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                disabled={index === blocks.length - 1}
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                              <select
                                value={block.type}
                                onChange={(e) => updateBlock(block.id, { type: e.target.value as BuilderBlockType })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                              >
                                <option value="TEXT_BLOCK">Text Block</option>
                                <option value="LINK">Link</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                              <input
                                type="text"
                                value={block.title}
                                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <input
                                type="text"
                                value={block.description}
                                onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            {block.type === 'LINK' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                                <input
                                  type="text"
                                  value={block.url || ''}
                                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                              </div>
                            )}
                            {block.type === 'TEXT_BLOCK' && (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                                <textarea
                                  value={block.content || ''}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Preview */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                  <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b">
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{category}</p>
                      <h4 className="text-2xl font-bold text-gray-900">{displayName || 'Display Name'}</h4>
                      <p className="text-sm text-gray-600">{headerTitle || 'Role or headline'}</p>
                      {bio && <p className="text-sm text-gray-500 mt-2 line-clamp-3 whitespace-pre-line">{bio}</p>}
                    </div>
                    {templateType === 'FULL_PAGE' ? (
                      <div className="divide-y">
                        {blocks.length === 0 ? (
                          <div className="px-6 py-10 text-center text-sm text-gray-400">Add blocks to preview layout</div>
                        ) : (
                          blocks.map((block) => (
                            <div key={block.id} className="px-6 py-4 space-y-1">
                              <p className="text-xs uppercase tracking-wide text-gray-400">{block.type}</p>
                              <p className="text-base font-semibold text-gray-900">{block.title || 'Untitled Block'}</p>
                              {block.type === 'TEXT_BLOCK' ? (
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                  {block.content || block.description || 'Text content will appear here.'}
                                </p>
                              ) : (
                                <p className="text-sm text-indigo-600">{block.url || 'https://your-link.com'}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-10 text-center text-sm text-gray-400">Bio templates include header only.</div>
                    )}
                  </div>
                </section>
              </div>

              <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-white"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateBuilder;

