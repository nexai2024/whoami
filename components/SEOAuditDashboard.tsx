"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getSEOScoreStatus } from '@/lib/seo/seoAudit';

const {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiRefreshCw,
  FiExternalLink,
  FiTrendingUp,
  FiXCircle
} = FiIcons;

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SEOAuditResult {
  score: number;
  issues: SEOIssue[];
  passed: number;
  warnings: number;
  errors: number;
  recommendations: string[];
}

interface SEOAuditDashboardProps {
  pageId: string;
  onRefresh?: () => void;
}

const SEOAuditDashboard: React.FC<SEOAuditDashboardProps> = ({ pageId, onRefresh }) => {
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAudit();
  }, [pageId]);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}/seo/audit`, {
        headers: {
          'x-user-id': 'demo-user' // Replace with actual auth
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditResult(data.audit);
      } else {
        toast.error('Failed to load SEO audit');
      }
    } catch (error) {
      console.error('Error fetching SEO audit:', error);
      toast.error('Failed to load SEO audit');
    } finally {
      setLoading(false);
    }
  };

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index.toString())) {
      newExpanded.delete(index.toString());
    } else {
      newExpanded.add(index.toString());
    }
    setExpandedIssues(newExpanded);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <FiXCircle className="text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      default:
        return <FiInfo className="text-gray-500" />;
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!auditResult) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">No audit data available</p>
      </div>
    );
  }

  const scoreStatus = getSEOScoreStatus(auditResult.score);
  const scoreColor = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600'
  }[scoreStatus.status];

  const scoreBgColor = {
    excellent: 'bg-green-100',
    good: 'bg-blue-100',
    fair: 'bg-yellow-100',
    poor: 'bg-red-100'
  }[scoreStatus.status];

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">SEO Score</h2>
          <button
            onClick={fetchAudit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiRefreshCw className="text-lg" />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className={`${scoreBgColor} rounded-full w-24 h-24 flex items-center justify-center`}>
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {auditResult.score}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className={`text-lg ${scoreColor}`} />
              <span className={`font-semibold ${scoreColor}`}>
                {scoreStatus.status.charAt(0).toUpperCase() + scoreStatus.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {auditResult.errors} errors, {auditResult.warnings} warnings, {auditResult.passed} info items
            </p>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      {auditResult.recommendations.length > 0 && (
        <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <FiInfo className="text-lg" />
            Top Recommendations
          </h3>
          <ul className="space-y-2">
            {auditResult.recommendations.map((rec, index) => (
              <li key={index} className="text-indigo-800 text-sm flex items-start gap-2">
                <span className="text-indigo-500 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900">Issues & Recommendations</h3>
        </div>

        <div className="divide-y">
          {auditResult.issues.map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => toggleIssue(index)}
              >
                <div className="mt-1">
                  {getIssueIcon(issue.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">{issue.message}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    <span className="text-xs text-gray-500">{issue.field}</span>
                  </div>

                  {expandedIssues.has(index.toString()) && issue.recommendation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-sm text-gray-700">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="text-gray-400">
                  {expandedIssues.has(index.toString()) ? (
                    <FiXCircle className="text-lg" />
                  ) : (
                    <FiExternalLink className="text-lg" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {auditResult.issues.length === 0 && (
            <div className="p-12 text-center">
              <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Perfect SEO Score!</h3>
              <p className="text-gray-600">Your page is optimized for search engines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOAuditDashboard;


