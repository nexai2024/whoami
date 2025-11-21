"use client";
import React, { useState } from 'react';
import TemplateBrowser from '@/components/TemplateBrowser';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import TemplateBuilder from '@/components/templates/TemplateBuilder';

export default function TemplatesPage() {
  const router = useRouter();
  const [showBuilder, setShowBuilder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTemplateCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
              <p className="text-gray-600 mt-2">
                Browse our collection of professionally designed templates or generate custom templates with AI
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBuilder(true)}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Build Template Manually
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateBrowser
          templateType="ALL"
          showAIGenerate={true}
          refreshKey={refreshKey}
        />
      </div>

      <TemplateBuilder
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        onCreated={handleTemplateCreated}
      />
    </div>
  );
}
