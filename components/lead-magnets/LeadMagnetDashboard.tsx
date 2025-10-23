'use client';

/**
 * Lead Magnet Dashboard Component
 * Main interface for managing lead magnets
 */

import { useState, useEffect } from 'react';
import { MagnetType, MagnetStatus, DeliveryMethod } from '@prisma/client';
import toast from 'react-hot-toast';

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

  // Form state
  const [creationMethod, setCreationMethod] = useState<'UPLOAD' | 'TEMPLATE' | 'AI_GENERATE'>('UPLOAD');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    headline: '',
    description: '',
    deliveryMethod: 'INSTANT_DOWNLOAD',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchLeadMagnets();
    fetchTemplates();
  }, []);

  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch('/api/lead-magnets', {
        headers: { 'x-user-id': 'demo-user' }
      });
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

  // Reset form to initial state
  const resetForm = () => {
    setCreationMethod('UPLOAD');
    setFormData({ name: '', type: '', headline: '', description: '', deliveryMethod: 'INSTANT_DOWNLOAD' });
    setSelectedFile(null);
    setUploadedFileData(null);
    setSelectedTemplateId('');
    setAiPrompt('');
    setFormErrors({});
    setIsSubmitting(false);
    setUploadingFile(false);
  };

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formData.name) {
      errors.name = 'Lead magnet name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Validate type
    if (!formData.type) {
      errors.type = 'Please select a type';
    }

    // Validate headline
    if (!formData.headline) {
      errors.headline = 'Headline is required';
    } else if (formData.headline.length < 10) {
      errors.headline = 'Headline must be at least 10 characters';
    } else if (formData.headline.length > 200) {
      errors.headline = 'Headline must be less than 200 characters';
    }

    // Validate description length (optional field)
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // Validate delivery method
    if (!formData.deliveryMethod) {
      errors.deliveryMethod = 'Please select a delivery method';
    }

    // Method-specific validation
    if (creationMethod === 'UPLOAD' && !uploadedFileData) {
      errors.file = 'Please upload a file';
    }

    if (creationMethod === 'TEMPLATE' && !selectedTemplateId) {
      errors.template = 'Please select a template';
    }

    if (creationMethod === 'AI_GENERATE') {
      if (!aiPrompt) {
        errors.aiPrompt = 'Please describe your lead magnet';
      } else if (aiPrompt.length < 20) {
        errors.aiPrompt = 'Description must be at least 20 characters';
      } else if (aiPrompt.length > 500) {
        errors.aiPrompt = 'Description must be less than 500 characters';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    setFormErrors(prev => ({ ...prev, file: '' }));

    try {
      // Validate file type
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'mp4', 'mp3', 'jpg', 'jpeg', 'png'];
      
      if (!allowedExtensions.includes(extension)) {
        setFormErrors(prev => ({ 
          ...prev, 
          file: 'File type not supported. Allowed: PDF, DOC, DOCX, XLS, XLSX, ZIP, MP4, MP3, JPG, PNG' 
        }));
        return;
      }

      // Validate file size
      if (file.size > 52428800) {
        setFormErrors(prev => ({ ...prev, file: 'File size exceeds 50MB limit' }));
        return;
      }

      // Upload file
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user'
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors(prev => ({ 
          ...prev, 
          file: errorData.error || 'Upload failed. Please try again.' 
        }));
        return;
      }

      const data = await response.json();
      setUploadedFileData(data);
      setFormErrors(prev => ({ ...prev, file: '' }));
    } catch (error) {
      console.error('Upload error:', error);
      setFormErrors(prev => ({ 
        ...prev, 
        file: 'Upload failed. Please try again.' 
      }));
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload
      const payload: any = {
        name: formData.name,
        type: formData.type,
        headline: formData.headline,
        description: formData.description || undefined,
        deliveryMethod: formData.deliveryMethod,
        creationMethod: creationMethod
      };

      // Add method-specific fields
      if (creationMethod === 'UPLOAD') {
        payload.fileUrl = uploadedFileData.fileUrl;
        payload.fileName = uploadedFileData.fileName;
        payload.fileSize = uploadedFileData.fileSize;
        payload.mimeType = uploadedFileData.mimeType;
      } else if (creationMethod === 'TEMPLATE') {
        payload.templateId = selectedTemplateId;
      } else if (creationMethod === 'AI_GENERATE') {
        payload.aiPrompt = aiPrompt;
      }

      // Make API request
      const response = await fetch('/api/lead-magnets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 200) {
        toast.success('Lead magnet created successfully!');
        resetForm();
        await fetchLeadMagnets();
        setShowCreateModal(false);
      } else if (response.status === 202) {
        toast.success('Generating your lead magnet... This may take 2-3 minutes. Check back soon!');
        resetForm();
        await fetchLeadMagnets();
        setShowCreateModal(false);
      } else if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create lead magnet');
      } else if (response.status === 401) {
        toast.error('Authentication required. Please log in.');
      } else {
        toast.error('Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Network error. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
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
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Creation Method Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setCreationMethod('UPLOAD')}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                    creationMethod === 'UPLOAD'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>📤</span>
                    <span>Upload</span>
                  </div>
                </button>
                <button
                  onClick={() => setCreationMethod('TEMPLATE')}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                    creationMethod === 'TEMPLATE'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>📋</span>
                    <span>Template</span>
                  </div>
                </button>
                <button
                  onClick={() => setCreationMethod('AI_GENERATE')}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                    creationMethod === 'AI_GENERATE'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>AI Generate</span>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                {/* Lead Magnet Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Magnet Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Free Email Marketing Checklist"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: '' });
                    }}
                    onBlur={() => {
                      if (!formData.name) {
                        setFormErrors({ ...formErrors, name: 'Lead magnet name is required' });
                      } else if (formData.name.length < 3) {
                        setFormErrors({ ...formErrors, name: 'Name must be at least 3 characters' });
                      } else {
                        setFormErrors({ ...formErrors, name: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      setFormErrors({ ...formErrors, type: '' });
                    }}
                    onBlur={() => {
                      if (!formData.type) {
                        setFormErrors({ ...formErrors, type: 'Please select a type' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
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
                  {formErrors.type && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                  )}
                </div>

                {/* Conditional Fields Based on Creation Method */}
                {creationMethod === 'UPLOAD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.mp3,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          handleFileUpload(file);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        {uploadingFile && (
                          <p className="text-blue-600 flex items-center gap-2 mt-1">
                            <span className="animate-spin">⏳</span>
                            Uploading...
                          </p>
                        )}
                        {uploadedFileData && (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-green-600 flex items-center gap-1">
                              <span>✓</span>
                              Upload complete
                            </p>
                            <button
                              onClick={() => {
                                setSelectedFile(null);
                                setUploadedFileData(null);
                              }}
                              className="text-red-600 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {formErrors.file && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>
                    )}
                  </div>
                )}

                {creationMethod === 'TEMPLATE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Template *
                    </label>
                    {templates.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-2">No templates available.</p>
                        <button
                          onClick={() => setCreationMethod('UPLOAD')}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Try uploading a file instead
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => {
                              setSelectedTemplateId(template.id);
                              setFormErrors({ ...formErrors, template: '' });
                            }}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                              selectedTemplateId === template.id
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={template.thumbnailUrl}
                              alt={template.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2">
                              <p className="font-semibold text-sm truncate">{template.name}</p>
                              <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded mt-1">
                                {template.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {formErrors.template && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.template}</p>
                    )}
                  </div>
                )}

                {creationMethod === 'AI_GENERATE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your lead magnet *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g., Create a 5-page PDF checklist for email marketing beginners covering subject lines, segmentation, and A/B testing"
                      value={aiPrompt}
                      maxLength={500}
                      onChange={(e) => {
                        setAiPrompt(e.target.value);
                        setFormErrors({ ...formErrors, aiPrompt: '' });
                      }}
                      onBlur={() => {
                        if (!aiPrompt) {
                          setFormErrors({ ...formErrors, aiPrompt: 'Please describe your lead magnet' });
                        } else if (aiPrompt.length < 20) {
                          setFormErrors({ ...formErrors, aiPrompt: 'Description must be at least 20 characters' });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        formErrors.aiPrompt ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-gray-500 text-xs mt-1">{aiPrompt.length} / 500 characters</p>
                    {formErrors.aiPrompt && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.aiPrompt}</p>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <span>⏱️</span>
                        AI generation takes 2-3 minutes. Your lead magnet will be created as a draft and processed in the background.
                      </p>
                    </div>
                  </div>
                )}

                {/* Headline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline *
                  </label>
                  <input
                    type="text"
                    placeholder="Your attention-grabbing headline"
                    value={formData.headline}
                    onChange={(e) => {
                      setFormData({ ...formData, headline: e.target.value });
                      setFormErrors({ ...formErrors, headline: '' });
                    }}
                    onBlur={() => {
                      if (!formData.headline) {
                        setFormErrors({ ...formErrors, headline: 'Headline is required' });
                      } else if (formData.headline.length < 10) {
                        setFormErrors({ ...formErrors, headline: 'Headline must be at least 10 characters' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.headline ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.headline && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.headline}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what subscribers will get..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setFormErrors({ ...formErrors, description: '' });
                    }}
                    onBlur={() => {
                      if (formData.description && formData.description.length > 1000) {
                        setFormErrors({ ...formErrors, description: 'Description must be less than 1000 characters' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method *
                  </label>
                  <select
                    value={formData.deliveryMethod}
                    onChange={(e) => {
                      setFormData({ ...formData, deliveryMethod: e.target.value });
                      setFormErrors({ ...formErrors, deliveryMethod: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.deliveryMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="INSTANT_DOWNLOAD">Instant Download</option>
                    <option value="EMAIL_DELIVERY">Email Delivery</option>
                    <option value="GATED_ACCESS">Gated Access</option>
                    <option value="DRIP_COURSE">Drip Course</option>
                  </select>
                  {formErrors.deliveryMethod && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.deliveryMethod}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 After creation, you can upload files, customize the opt-in page, and connect email integrations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadingFile}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isSubmitting || uploadingFile
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Lead Magnet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
