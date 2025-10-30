'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPlus, FiEdit3, FiPlay, FiPause, FiGitBranch, FiZap, FiActivity, FiClock, FiCheck, FiAlertCircle, FiTool } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { useAuth } from '@/lib/auth/AuthContext.jsx';
import toast from 'react-hot-toast';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  enabled: boolean;
  trigger?: {
    type: string;
    config: any;
  };
  steps: any[];
  executions: any[];
  _count?: {
    executions: number;
  };
  createdAt: string;
  updatedAt: string;
}

const WorkflowsPage = () => {
  const { currUser } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all');

  useEffect(() => {
    if (currUser) {
      loadWorkflows();
    }
  }, [currUser, filter]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'active') {
        params.append('enabled', 'true');
      } else if (filter === 'draft') {
        params.append('status', 'DRAFT');
      }

      const response = await fetch(`/api/workflows?${params.toString()}`, {
        headers: {
          'x-user-id': currUser.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } else {
        toast.error('Failed to load workflows');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, currentlyEnabled: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id
        },
        body: JSON.stringify({ enabled: !currentlyEnabled })
      });

      if (response.ok) {
        toast.success(currentlyEnabled ? 'Workflow paused' : 'Workflow activated');
        loadWorkflows();
      } else {
        toast.error('Failed to update workflow');
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const handleTestWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currUser.id,
        },
        body: JSON.stringify({
          testData: {
            email: 'test@example.com',
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Workflow test completed! Check console for details.');
        console.log('Workflow test result:', result);
      } else {
        toast.error('Workflow test failed');
      }
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      PAUSED: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.DRAFT}`}>
        {status.toLowerCase()}
      </span>
    );
  };

  const getTriggerLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      NEW_SUBSCRIBER: 'New Subscriber',
      NEW_COURSE_ENROLLMENT: 'Course Enrollment',
      LESSON_COMPLETED: 'Lesson Completed',
      COURSE_COMPLETED: 'Course Completed',
      FORM_SUBMITTED: 'Form Submitted',
      PRODUCT_PURCHASED: 'Product Purchased',
      PAGE_VIEWED: 'Page Viewed',
      BLOCK_CLICKED: 'Block Clicked',
      TAG_ADDED: 'Tag Added',
      TAG_REMOVED: 'Tag Removed',
      SCHEDULE: 'Scheduled',
      WEBHOOK: 'Webhook',
      MANUAL: 'Manual Trigger'
    };
    return labels[triggerType] || triggerType;
  };

  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view your workflows.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'all') return true;
    if (filter === 'active') return workflow.enabled && workflow.status === 'ACTIVE';
    if (filter === 'draft') return workflow.status === 'DRAFT';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border p-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <SafeIcon name={undefined}  icon={FiGitBranch} className="text-purple-600 text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
              </div>
              <p className="text-gray-600">
                Build automated workflows to engage your audience
              </p>
            </div>
            <Link
              href="/workflows/new"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiPlus} />
              Create New Workflow
            </Link>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Workflows
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'draft'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Workflows List */}
        {filteredWorkflows.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <SafeIcon name={undefined}  icon={FiGitBranch} className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first automation workflow to engage your audience automatically
            </p>
            <Link
              href="/workflows/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiPlus} />
              Create Your First Workflow
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{workflow.name}</h3>
                      {getStatusBadge(workflow.status)}
                      <div
                        className={`w-3 h-3 rounded-full ${
                          workflow.enabled ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                        title={workflow.enabled ? 'Active' : 'Paused'}
                      ></div>
                    </div>

                    {workflow.description && (
                      <p className="text-gray-600 mb-4">{workflow.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {workflow.trigger && (
                        <div className="flex items-center gap-2">
                          <SafeIcon name={undefined}  icon={FiZap} className="text-yellow-500" />
                          <span>Trigger: {getTriggerLabel(workflow.trigger.type)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <SafeIcon name={undefined}  icon={FiActivity} />
                        <span>{workflow.steps?.length || 0} steps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SafeIcon name={undefined}  icon={FiCheck} />
                        <span>{workflow._count?.executions || 0} executions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        workflow.enabled
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={workflow.enabled ? 'Pause Workflow' : 'Activate Workflow'}
                    >
                      <SafeIcon name={undefined}  icon={workflow.enabled ? FiPause : FiPlay} />
                    </button>
                    <Link
                      href={`/workflows/${workflow.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-50 rounded-lg"
                      title="Edit Workflow"
                    >
                      <SafeIcon name={undefined}  icon={FiEdit3} />
                    </Link>
                    <Link
                      href={`/workflows/${workflow.id}/analytics`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-50 rounded-lg"
                      title="View Analytics"
                    >
                      <SafeIcon name={undefined}  icon={FiActivity} />
                    </Link>
                  </div>
                </div>

                {/* Recent Executions Preview */}
                {workflow.executions && workflow.executions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <SafeIcon name={undefined}  icon={FiClock} />
                      <span>
                        Last executed{' '}
                        {new Date(workflow.executions[0].createdAt).toLocaleDateString()}
                      </span>
                      {workflow.executions[0].status === 'COMPLETED' && (
                        <span className="flex items-center gap-1 text-green-600">
                          <SafeIcon name={undefined}  icon={FiCheck} />
                          Success
                        </span>
                      )}
                      {workflow.executions[0].status === 'FAILED' && (
                        <span className="flex items-center gap-1 text-red-600">
                          <SafeIcon name={undefined}  icon={FiAlertCircle} />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsPage;
