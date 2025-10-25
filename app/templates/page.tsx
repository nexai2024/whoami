"use client";
import React from 'react';
import TemplateBrowser from '@/components/TemplateBrowser';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
            <p className="text-gray-600 mt-2">
              Browse our collection of professionally designed templates or generate custom templates with AI
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateBrowser
          templateType="ALL"
          showAIGenerate={true}
        />
      </div>
    </div>
  );
}
