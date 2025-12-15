"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const {
  FiTrendingUp,
  FiEye,
  FiMousePointer,
  FiDollarSign,
  FiUsers,
  FiBarChart2,
  FiRefreshCw
} = FiIcons;

interface TemplatePerformanceAnalyticsProps {
  templateId?: string;
  pageId?: string;
  userId?: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const TemplatePerformanceAnalytics: React.FC<TemplatePerformanceAnalyticsProps> = ({
  templateId,
  pageId,
  userId
}) => {
  const [performance, setPerformance] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchPerformance();
  }, [templateId, pageId, timeRange]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange
      });
      if (templateId) params.append('templateId', templateId);
      if (pageId) params.append('pageId', pageId);

      const response = await fetch(`/api/templates/performance?${params}`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performance || []);
        setSummary(data.summary);
      } else {
        toast.error('Failed to load performance data');
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-bold text-gray-900">Template Performance</h2>
          <p className="text-gray-600 text-sm mt-1">Track how your templates perform</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchPerformance}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiRefreshCw className="text-lg" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Views</span>
              <FiEye className="text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all templates</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Clicks</span>
              <FiMousePointer className="text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.avgConversionRate.toFixed(1)}% conversion
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <FiDollarSign className="text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${summary.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From template pages</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Engagement</span>
              <FiUsers className="text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.avgEngagementTime}s
            </div>
            <p className="text-xs text-gray-500 mt-1">Time on page</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {performance.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views & Clicks Trend */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Views & Clicks Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversion Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
                  />
                  <Legend />
                  <Bar dataKey="conversionRate" fill="#6366f1" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          {performance.some((p: any) => p.revenue > 0) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {performance.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FiBarChart2 className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data yet</h3>
          <p className="text-gray-600">Performance data will appear as your templates get traffic</p>
        </div>
      )}
    </div>
  );
};

export default TemplatePerformanceAnalytics;






