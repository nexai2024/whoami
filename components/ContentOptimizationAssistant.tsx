"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const {
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp
} = FiIcons;

interface Optimization {
  id: string;
  suggestionType: string;
  field: string;
  currentValue?: string;
  suggestedValue: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  impactScore?: number;
  applied: boolean;
}

interface ContentOptimizationAssistantProps {
  pageId: string;
  blockId?: string;
  userId?: string;
  onOptimize?: () => void;
}

const ContentOptimizationAssistant: React.FC<ContentOptimizationAssistantProps> = ({
  pageId,
  blockId,
  userId,
  onOptimize
}) => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizations();
  }, [pageId, blockId]);

  const fetchOptimizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}/content/optimize${blockId ? `?blockId=${blockId}` : ''}`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOptimizations(data.optimizations || []);
      } else {
        toast.error('Failed to load optimizations');
      }
    } catch (error) {
      console.error('Error fetching optimizations:', error);
      toast.error('Failed to load optimizations');
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = async (optimization: Optimization) => {
    try {
      setApplying(optimization.id);
      const response = await fetch(`/api/content/optimizations/${optimization.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        toast.success('Optimization applied!');
        setOptimizations(prev =>
          prev.map(opt =>
            opt.id === optimization.id ? { ...opt, applied: true } : opt
          )
        );
        if (onOptimize) {
          onOptimize();
        }
      } else {
        toast.error('Failed to apply optimization');
      }
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization');
    } finally {
      setApplying(null);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <FiAlertCircle className="text-red-600" />;
      case 'medium':
        return <FiAlertCircle className="text-yellow-600" />;
      case 'low':
        return <FiAlertCircle className="text-blue-600" />;
      default:
        return <FiAlertCircle className="text-gray-600" />;
    }
  };

  const highPriority = optimizations.filter(o => o.priority === 'high' && !o.applied);
  const mediumPriority = optimizations.filter(o => o.priority === 'medium' && !o.applied);
  const lowPriority = optimizations.filter(o => o.priority === 'low' && !o.applied);
  const applied = optimizations.filter(o => o.applied);

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
            <FiZap className="text-indigo-600" />
            AI Content Optimization
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Get AI-powered suggestions to improve your content
          </p>
        </div>
        <button
          onClick={fetchOptimizations}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {optimizations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-900">Optimization Summary</p>
              <p className="text-sm text-indigo-700 mt-1">
                {highPriority.length} high priority, {mediumPriority.length} medium, {lowPriority.length} low priority suggestions
              </p>
            </div>
            {applied.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-green-700">
                <FiCheckCircle />
                <span className="text-sm font-medium">{applied.length} applied</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimizations List */}
      {optimizations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <span className="inline-block text-gray-400 text-5xl mx-auto mb-4" role="img" aria-label="Sparkles">
            ✨
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No optimizations needed</h3>
          <p className="text-gray-600">Your content is already optimized!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* High Priority */}
          {highPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiAlertCircle className="text-red-600" />
                High Priority ({highPriority.length})
              </h3>
              <div className="space-y-3">
                {highPriority.map(opt => (
                  <OptimizationCard
                    key={opt.id}
                    optimization={opt}
                    expanded={expanded.has(opt.id)}
                    onToggle={() => toggleExpand(opt.id)}
                    onApply={() => applyOptimization(opt)}
                    applying={applying === opt.id}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityIcon}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiAlertCircle className="text-yellow-600" />
                Medium Priority ({mediumPriority.length})
              </h3>
              <div className="space-y-3">
                {mediumPriority.map(opt => (
                  <OptimizationCard
                    key={opt.id}
                    optimization={opt}
                    expanded={expanded.has(opt.id)}
                    onToggle={() => toggleExpand(opt.id)}
                    onApply={() => applyOptimization(opt)}
                    applying={applying === opt.id}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityIcon}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {lowPriority.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiAlertCircle className="text-blue-600" />
                Low Priority ({lowPriority.length})
              </h3>
              <div className="space-y-3">
                {lowPriority.map(opt => (
                  <OptimizationCard
                    key={opt.id}
                    optimization={opt}
                    expanded={expanded.has(opt.id)}
                    onToggle={() => toggleExpand(opt.id)}
                    onApply={() => applyOptimization(opt)}
                    applying={applying === opt.id}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityIcon}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Applied */}
          {applied.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                Applied ({applied.length})
              </h3>
              <div className="space-y-3">
                {applied.map(opt => (
                  <div
                    key={opt.id}
                    className="bg-white rounded-lg border border-green-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{opt.field}</p>
                          <p className="text-sm text-gray-600">{opt.suggestionType}</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        Applied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OptimizationCard: React.FC<{
  optimization: Optimization;
  expanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  applying: boolean;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}> = ({ optimization, expanded, onToggle, onApply, applying, getPriorityColor, getPriorityIcon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getPriorityIcon(optimization.priority)}
              <div>
                <p className="font-medium text-gray-900">{optimization.field}</p>
                <p className="text-sm text-gray-600">{optimization.suggestionType}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(optimization.priority)}`}>
                {optimization.priority}
              </span>
              {optimization.impactScore && (
                <span className="text-xs text-gray-500">
                  Impact: +{optimization.impactScore} points
                </span>
              )}
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-3"
                >
                  {optimization.currentValue && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Current:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{optimization.currentValue}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Suggested:</p>
                    <p className="text-sm text-gray-900 bg-indigo-50 p-2 rounded">{optimization.suggestedValue}</p>
                  </div>
                  {optimization.reason && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Why:</p>
                      <p className="text-sm text-gray-600">{optimization.reason}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <button
              onClick={onApply}
              disabled={applying || optimization.applied}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {applying ? 'Applying...' : optimization.applied ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentOptimizationAssistant;




