'use client';

/**
 * Lead Magnet Dashboard Component
 * Main interface for managing lead magnets
 */

import { useState, useEffect } from 'react';
import { MagnetType, MagnetStatus, DeliveryMethod } from '@prisma/client';

interface LeadMagnet {
  id: string;
  name: string;
  type: MagnetType;
  headline: string;
  status: MagnetStatus;
  deliveryMethod: DeliveryMethod;
  coverImageUrl: string | null;
  stats: {
    views: number;
    optIns: number;
    downloads: number;
    conversionRate: number;
  };
  assetCount: number;
  deliveryCount: number;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: MagnetType;
  thumbnailUrl: string;
  useCount: number;
  featured: boolean;
}

export default function LeadMagnetDashboard() {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'magnets' | 'templates'>('magnets');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchLeadMagnets();
    fetchTemplates();
  }, []);

  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch('/api/lead-magnets');
      const data = await response.json();
      setMagnets(data.leadMagnets || []);
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/lead-magnets/templates?featured=true');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const getTypeIcon = (type: MagnetType) => {
    const icons: Record<MagnetType, string> = {
      PDF: '📄',
      EBOOK: '📚',
      TEMPLATE: '📋',
      CHECKLIST: '✓',
      WORKBOOK: '📝',
      VIDEO: '🎥',
      VIDEO_COURSE: '🎬',
      AUDIO: '🎧',
      SPREADSHEET: '📊',
      ZIP_BUNDLE: '📦',
      CUSTOM: '📁',
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status: MagnetStatus) => {
    const colors: Record<MagnetStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8" data-tour-id="lead-magnet-header">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lead Magnets
        </h1>
        <p className="text-gray-600">
          Create and manage content upgrades to grow your email list
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6" data-tour-id="lead-magnet-tabs">
        <nav className="flex space-x-8">
          {[
            { id: 'magnets', label: 'My Lead Magnets', count: magnets.length },
            { id: 'templates', label: 'Templates', count: templates.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* My Lead Magnets Tab */}
      {activeTab === 'magnets' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Active Lead Magnets</h2>
              <p className="text-sm text-gray-600">
                {magnets.length} lead magnets created
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              data-tour-id="create-magnet-button"
            >
              + Create Lead Magnet
            </button>
          </div>

          {/* Magnets Grid */}
          {magnets.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-gray-500 mb-4">No lead magnets yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first lead magnet →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {magnets.map((magnet) => (
                <div
                  key={magnet.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Cover Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {magnet.coverImageUrl ? (
                      <img
                        src={magnet.coverImageUrl}
                        alt={magnet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">
                        {getTypeIcon(magnet.type)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {magnet.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          magnet.status
                        )}`}
                      >
                        {magnet.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {magnet.headline}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center" data-tour-id="magnet-stats">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-semibold text-gray-900">
                          {magnet.stats.views}
                        </div>
                        <div className="text-xs text-gray-600">Views</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2">
                        <div className="text-lg font-semibold text-blue-600">
                          {magnet.stats.optIns}
                        </div>
                        <div className="text-xs text-gray-600">Opt-ins</div>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-lg font-semibold text-green-600">
                          {magnet.stats.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">CVR</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700">
                        View Details
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div data-tour-id="templates-tab">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Featured Templates</h2>
            <p className="text-sm text-gray-600">
              Professional templates to jumpstart your lead magnets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Template Thumbnail */}
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {template.name}
                    </h3>
                    {template.featured && (
                      <span className="text-yellow-500 text-sm">⭐</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {template.category}
                    </span>
                    <span>{template.useCount} uses</span>
                  </div>

                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Lead Magnet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Lead Magnet
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Magnet Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Free Email Marketing Checklist"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a type...</option>
                    <option value="PDF">PDF Document</option>
                    <option value="EBOOK">eBook</option>
                    <option value="TEMPLATE">Template</option>
                    <option value="CHECKLIST">Checklist</option>
                    <option value="WORKBOOK">Workbook</option>
                    <option value="VIDEO">Video</option>
                    <option value="VIDEO_COURSE">Video Course</option>
                    <option value="AUDIO">Audio</option>
                    <option value="SPREADSHEET">Spreadsheet</option>
                    <option value="ZIP_BUNDLE">ZIP Bundle</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline *
                  </label>
                  <input
                    type="text"
                    placeholder="Your attention-grabbing headline"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what subscribers will get..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method *
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose delivery method...</option>
                    <option value="INSTANT_DOWNLOAD">Instant Download</option>
                    <option value="EMAIL_DELIVERY">Email Delivery</option>
                    <option value="GATED_ACCESS">Gated Access</option>
                    <option value="DRIP_COURSE">Drip Course</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 After creation, you can upload files, customize the opt-in page, and connect email integrations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement create functionality
                    alert('Create lead magnet functionality will be implemented here. This would call POST /api/lead-magnets with the form data.');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Lead Magnet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
