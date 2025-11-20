'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  FiPlus, FiSave, FiEye, FiTrash2, FiEdit3, FiArrowRight,
  FiUpload, FiSettings, FiMove, FiCheck, FiX
} from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { useAuth } from '@/lib/auth/AuthContext.jsx';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/common/RichTextEditor';

interface FunnelStep {
  id?: string;
  name: string;
  slug: string;
  type: string;
  order: number;
  headline?: string;
  subheadline?: string;
  content?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  videoUrl?: string;
  formConfig?: any;
  pageData?: any;
}

const STEP_TYPES = [
  { value: 'LANDING_PAGE', label: 'Landing Page', description: 'Initial entry point' },
  { value: 'LEAD_CAPTURE', label: 'Lead Capture', description: 'Collect email/info' },
  { value: 'SALES_PAGE', label: 'Sales Page', description: 'Present offer' },
  { value: 'VIDEO_SALES', label: 'Video Sales', description: 'Video-based pitch' },
  { value: 'ORDER_FORM', label: 'Order Form', description: 'Checkout page' },
  { value: 'UPSELL', label: 'Upsell', description: 'Additional offer' },
  { value: 'DOWNSELL', label: 'Downsell', description: 'Alternative offer' },
  { value: 'THANK_YOU', label: 'Thank You', description: 'Confirmation page' },
];

export default function FunnelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { currUser } = useAuth();
  const funnelId = params.id as string;

  const [funnel, setFunnel] = useState<any>(null);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  const [showAddStep, setShowAddStep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currUser && funnelId) {
      loadFunnel();
    }
  }, [currUser, funnelId]);

  const loadFunnel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${funnelId}`, {
        headers: { 'x-user-id': currUser.id },
      });

      if (response.ok) {
        const data = await response.json();
        setFunnel(data.funnel);
        setSteps(data.funnel.steps || []);
      } else {
        toast.error('Failed to load funnel');
      }
    } catch (error) {
      console.error('Error loading funnel:', error);
      toast.error('Failed to load funnel');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFunnel = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify(funnel),
      });

      if (response.ok) {
        toast.success('Funnel saved!');
      } else {
        toast.error('Failed to save funnel');
      }
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast.error('Failed to save funnel');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!funnel) return;

    try {
      const newStatus = funnel.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFunnel({ ...funnel, status: newStatus });
        toast.success(newStatus === 'ACTIVE' ? 'Funnel published!' : 'Funnel unpublished');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAddStep = async (stepData: Partial<FunnelStep>) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify(stepData),
      });

      if (response.ok) {
        const data = await response.json();
        setSteps([...steps, data.step]);
        setShowAddStep(false);
        toast.success('Step added!');
      } else {
        toast.error('Failed to add step');
      }
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Failed to add step');
    }
  };

  const handleUpdateStep = async (stepId: string, updates: Partial<FunnelStep>) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setSteps(steps.map(s => s.id === stepId ? data.step : s));
        setSelectedStep(data.step);
        toast.success('Step updated!');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Delete this step?')) return;

    try {
      const response = await fetch(`/api/funnels/${funnelId}/steps/${stepId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currUser.id },
      });

      if (response.ok) {
        setSteps(steps.filter(s => s.id !== stepId));
        if (selectedStep?.id === stepId) setSelectedStep(null);
        toast.success('Step deleted');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading funnel...</p>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Funnel not found</h1>
          <button
            onClick={() => router.push('/funnels')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Funnels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{funnel.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                funnel.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {funnel.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/f/${funnel.slug}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SafeIcon name={undefined} icon={FiEye} />
                Preview
              </button>
              <button
                onClick={handleSaveFunnel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <SafeIcon name={undefined} icon={FiSave} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handlePublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  funnel.status === 'ACTIVE'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <SafeIcon name={undefined} icon={FiUpload} />
                {funnel.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Steps List */}
          <div className="col-span-4 bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Funnel Steps</h2>
              <button
                onClick={() => setShowAddStep(true)}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <SafeIcon name={undefined} icon={FiPlus} />
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No steps yet</p>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  Add your first step
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStep?.id === step.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{step.name}</h3>
                        <p className="text-xs text-gray-500">{step.type.replace('_', ' ')}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStep(step.id!);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <SafeIcon name={undefined} icon={FiTrash2} />
                      </button>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <SafeIcon name={undefined} icon={FiArrowRight} className="text-gray-400 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Step Editor */}
          <div className="col-span-8 bg-white rounded-2xl shadow-sm border p-6">
            {selectedStep ? (
              <StepEditor
                step={selectedStep}
                onUpdate={(updates) => handleUpdateStep(selectedStep.id!, updates)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <SafeIcon name={undefined} icon={FiSettings} className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p>Select a step to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStep && (
        <AddStepModal
          onAdd={handleAddStep}
          onClose={() => setShowAddStep(false)}
          stepCount={steps.length}
        />
      )}
    </div>
  );
}

// Step Editor Component
function StepEditor({ step, onUpdate }: { step: FunnelStep; onUpdate: (updates: Partial<FunnelStep>) => void }) {
  const [localStep, setLocalStep] = useState(step);

  useEffect(() => {
    setLocalStep(step);
  }, [step]);

  const handleChange = (field: string, value: any) => {
    setLocalStep({ ...localStep, [field]: value });
  };

  const handleSave = () => {
    onUpdate(localStep);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Edit Step</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <SafeIcon name={undefined} icon={FiCheck} />
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step Name</label>
          <input
            type="text"
            value={localStep.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <input
            type="text"
            value={localStep.slug}
            onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input
            type="text"
            value={localStep.headline || ''}
            onChange={(e) => handleChange('headline', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter main headline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
          <input
            type="text"
            value={localStep.subheadline || ''}
            onChange={(e) => handleChange('subheadline', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter subheadline"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <RichTextEditor
              value={localStep.content || ''}
              onChange={(value) => handleChange('content', value)}
              placeholder="Enter page content (supports rich text formatting)"
              minHeight={240}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input
              type="text"
              value={localStep.ctaText || ''}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Get Started"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL (or next step slug)</label>
            <input
              type="text"
              value={localStep.ctaUrl || ''}
              onChange={(e) => handleChange('ctaUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="/next-step or https://..."
            />
          </div>
        </div>

        {localStep.type === 'VIDEO_SALES' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="text"
              value={localStep.videoUrl || ''}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
          <input
            type="text"
            value={localStep.backgroundImage || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

// Add Step Modal
function AddStepModal({ onAdd, onClose, stepCount }: any) {
  const [newStep, setNewStep] = useState({
    name: `Step ${stepCount + 1}`,
    slug: `step-${stepCount + 1}`,
    type: 'LANDING_PAGE',
    order: stepCount,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newStep);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Funnel Step</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <SafeIcon name={undefined} icon={FiX} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Step Name</label>
            <input
              type="text"
              value={newStep.name}
              onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
            <input
              type="text"
              value={newStep.slug}
              onChange={(e) => setNewStep({ ...newStep, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
            <select
              value={newStep.type}
              onChange={(e) => setNewStep({ ...newStep, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {STEP_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Step
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
