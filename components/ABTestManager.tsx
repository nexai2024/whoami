"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

const {
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiBarChart2,
  FiRefreshCw
} = FiIcons;

interface ABTestManagerProps {
  pageId: string;
  userId?: string;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  templateAId: string;
  templateBId: string;
  templateA?: any;
  templateB?: any;
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number;
  startDate?: string;
  endDate?: string;
  winnerTemplateId?: string;
  results?: any;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({
  pageId,
  userId
}) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<{ a: string; b: string }>({ a: '', b: '' });

  useEffect(() => {
    fetchTests();
  }, [pageId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}/ab-tests`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      } else {
        toast.error('Failed to load A/B tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const createTest = async (name: string, description: string, trafficSplit: number) => {
    if (!selectedTemplates.a || !selectedTemplates.b) {
      toast.error('Please select both templates');
      return;
    }

    try {
      const response = await fetch(`/api/pages/${pageId}/ab-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'demo-user'
        },
        body: JSON.stringify({
          name,
          description,
          templateAId: selectedTemplates.a,
          templateBId: selectedTemplates.b,
          trafficSplit
        })
      });

      if (response.ok) {
        toast.success('A/B test created!');
        setShowCreateModal(false);
        fetchTests();
      } else {
        toast.error('Failed to create test');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test');
    }
  };

  const startTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        toast.success('Test started!');
        fetchTests();
      } else {
        toast.error('Failed to start test');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test');
    }
  };

  const pauseTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/pause`, {
        method: 'POST',
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        toast.success('Test paused');
        fetchTests();
      } else {
        toast.error('Failed to pause test');
      }
    } catch (error) {
      console.error('Error pausing test:', error);
      toast.error('Failed to pause test');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {/* <FiFlask className="text-indigo-600" /> */}
            A/B Testing
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Test which templates perform better
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {/* Removed FiFlask icon to fix 'Cannot find name' error */}
          Create Test
        </button>
      </div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          {/* <FiFlask className="text-gray-400 text-5xl mx-auto mb-4" /> */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B tests yet</h3>
          <p className="text-gray-600 mb-4">Create your first test to compare template performance</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <ABTestCard
              key={test.id}
              test={test}
              onStart={() => startTest(test.id)}
              onPause={() => pauseTest(test.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateABTestModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTest}
          selectedTemplates={selectedTemplates}
          onTemplatesChange={setSelectedTemplates}
        />
      )}
    </div>
  );
};

const ABTestCard: React.FC<{
  test: ABTest;
  onStart: () => void;
  onPause: () => void;
}> = ({ test, onStart, onPause }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </span>
          </div>
          {test.description && (
            <p className="text-gray-600 text-sm">{test.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {test.status === 'draft' && (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiPlay />
              Start
            </button>
          )}
          {test.status === 'running' && (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <FiPause />
              Pause
            </button>
          )}
        </div>
      </div>

      {/* Templates Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Template A ({test.trafficSplit}%)</div>
          {test.templateA && (
            <div>
              <Image
                src={test.templateA.thumbnailUrl}
                alt={test.templateA.name}
                width={200}
                height={112}
                className="rounded mb-2"
              />
              <p className="text-sm font-medium">{test.templateA.name}</p>
            </div>
          )}
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Template B ({100 - test.trafficSplit}%)</div>
          {test.templateB && (
            <div>
              <Image
                src={test.templateB.thumbnailUrl}
                alt={test.templateB.name}
                width={200}
                height={112}
                className="rounded mb-2"
              />
              <p className="text-sm font-medium">{test.templateB.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {test.results && test.status === 'completed' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="text-indigo-600" />
            <span className="font-medium text-gray-900">Results</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Template A Conversion:</p>
              <p className="font-semibold text-gray-900">
                {test.results.templateA?.conversionRate?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Template B Conversion:</p>
              <p className="font-semibold text-gray-900">
                {test.results.templateB?.conversionRate?.toFixed(1)}%
              </p>
            </div>
          </div>
          {test.winnerTemplateId && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                <FiCheckCircle />
                Winner: {test.winnerTemplateId === test.templateAId ? 'Template A' : 'Template B'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateABTestModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, description: string, trafficSplit: number) => void;
  selectedTemplates: { a: string; b: string };
  onTemplatesChange: (templates: { a: string; b: string }) => void;
}> = ({ onClose, onCreate, selectedTemplates, onTemplatesChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trafficSplit, setTrafficSplit] = useState(50);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/pages?limit=50');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!name || !selectedTemplates.a || !selectedTemplates.b) {
      toast.error('Please fill in all required fields');
      return;
    }
    onCreate(name, description, trafficSplit);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Create A/B Test</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiXCircle className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Header Style Test"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="What are you testing?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Split: {trafficSplit}% / {100 - trafficSplit}%
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={trafficSplit}
              onChange={(e) => setTrafficSplit(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template A *
              </label>
              <select
                value={selectedTemplates.a}
                onChange={(e) => onTemplatesChange({ ...selectedTemplates, a: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template B *
              </label>
              <select
                value={selectedTemplates.b}
                onChange={(e) => onTemplatesChange({ ...selectedTemplates, b: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select template...</option>
                {templates.filter(t => t.id !== selectedTemplates.a).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Test
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ABTestManager;

