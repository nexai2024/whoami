"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import BlockRenderer from './BlockRenderer';
import Image from 'next/image';
const { FiMonitor, FiSmartphone, FiX, FiDownload, FiShare2 } = FiIcons;

interface TemplatePreviewProps {
  templateId: string;
  templateName: string;
  templateDescription?: string;
  headerData: any;
  blocksData: any[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  onClose?: () => void;
  onUse?: () => void;
  pageId?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateId,
  templateName,
  templateDescription,
  headerData,
  blocksData,
  templateType,
  onClose,
  onUse,
  pageId
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/templates/${templateId}/preview`;
      if (navigator.share) {
        await navigator.share({
          title: templateName,
          text: templateDescription || `Check out this ${templateName} template`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setSharing(true);
        setTimeout(() => setSharing(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{templateName}</h1>
              {templateDescription && (
                <p className="text-gray-600 mt-1">{templateDescription}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'desktop'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Desktop view"
                >
                  <FiMonitor className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'mobile'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Mobile view"
                >
                  <FiSmartphone className="text-lg" />
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiShare2 />
                <span>{sharing ? 'Copied!' : 'Share'}</span>
              </button>

              {/* Use Template Button */}
              {pageId && onUse && (
                <button
                  onClick={onUse}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiDownload />
                  Use This Template
                </button>
              )}

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-sm' : 'max-w-5xl'
          }`}
        >
          {/* Header Preview */}
          {headerData && (
            <div
              className="relative"
              style={{
                backgroundColor: headerData.backgroundColor || '#ffffff',
                color: headerData.textColor || '#000000',
              }}
            >
              {headerData.coverImageUrl && (
                <div className="relative h-64 w-full">
                  <Image
                    src={headerData.coverImageUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className={`p-6 ${headerData.coverImageUrl ? 'relative -mt-16' : ''}`}>
                <div className={`flex ${headerData.headerStyle === 'split' ? 'flex-row gap-6' : 'flex-col items-center text-center'}`}>
                  {headerData.profileImageUrl && (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                      <Image
                        src={headerData.profileImageUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className={headerData.headerStyle === 'split' ? 'flex-1' : 'mt-4'}>
                    {headerData.displayName && (
                      <h2 className="text-3xl font-bold mb-2">{headerData.displayName}</h2>
                    )}
                    {headerData.title && (
                      <p className="text-xl mb-1">{headerData.title}</p>
                    )}
                    {headerData.company && (
                      <p className="text-sm opacity-75 mb-2">{headerData.company}</p>
                    )}
                    {headerData.bio && (
                      <p className="mt-3 max-w-2xl">{headerData.bio}</p>
                    )}
                    {headerData.customIntroduction && (
                      <p className="text-sm mt-2 opacity-75">{headerData.customIntroduction}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blocks Preview */}
          {templateType === 'FULL_PAGE' && blocksData && blocksData.length > 0 && (
            <div className="p-6 space-y-6">
              {blocksData.map((block: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlockRenderer
                    block={block}
                    onBlockClick={() => {}}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {templateType === 'BIO_ONLY' && (!blocksData || blocksData.length === 0) && (
            <div className="p-12 text-center text-gray-500">
              <p>This is a Bio Only template with no content blocks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;

