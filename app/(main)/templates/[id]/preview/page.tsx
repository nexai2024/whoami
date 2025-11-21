"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplatePreview from '@/components/TemplatePreview';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';

interface TemplateData {
  id: string;
  name: string;
  description?: string;
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  header: any;
  blocks: any[];
}

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    // Get pageId from query params if available
    const urlParams = new URLSearchParams(window.location.search);
    const pageIdParam = urlParams.get('pageId');
    if (pageIdParam) {
      setPageId(pageIdParam);
    }

    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/pages/${templateId}/preview`, {
        headers: {
          'x-user-id': 'demo-user' // Replace with actual auth
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplate(data.preview);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load template');
        router.push('/templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template');
      router.push('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!pageId) {
      toast.error('No page selected. Please select a page first.');
      return;
    }

    try {
      setApplying(true);
      const response = await fetch(`/api/templates/pages/${templateId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user' // Replace with actual auth
        },
        body: JSON.stringify({ pageId })
      });

      if (response.ok) {
        toast.success('Template applied successfully!');
        // Redirect to the page editor
        router.push(`/pages/${pageId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template not found</h2>
          <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/templates')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>
      </div>

      <TemplatePreview
        templateId={templateId}
        templateName={template.name}
        templateDescription={template.description}
        headerData={template.header}
        blocksData={template.blocks}
        templateType={template.templateType}
        onUse={handleUseTemplate}
        pageId={pageId || undefined}
      />
    </div>
  );
}

