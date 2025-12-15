"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  FiTrendingDown,
  FiRefreshCw,
  FiTarget,
  FiBarChart2,
  FiCalendar,
  FiAward
} = FiIcons;

interface SEOPerformanceDashboardProps {
  pageId: string;
  userId?: string;
}

interface PerformanceData {
  date: string;
  score: number;
  errors: number;
  warnings: number;
  organicTraffic?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
}

const SEOPerformanceDashboard: React.FC<SEOPerformanceDashboardProps> = ({
  pageId,
  userId
}) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchPerformanceData();
  }, [pageId, timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange
      });

      const response = await fetch(`/api/pages/${pageId}/seo/performance?${params}`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance || []);
        setCurrentScore(data.currentScore || 0);
      } else {
        toast.error('Failed to load SEO performance data');
      }
    } catch (error) {
      console.error('Error fetching SEO performance:', error);
      toast.error('Failed to load SEO performance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (performanceData.length < 2) return { trend: 0, percentage: 0 };
    const first = performanceData[0].score;
    const last = performanceData[performanceData.length - 1].score;
    const trend = last - first;
    const percentage = first > 0 ? ((trend / first) * 100) : 0;
    return { trend, percentage };
  };

  const { trend, percentage } = calculateTrend();

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
          <h2 className="text-xl font-bold text-gray-900">SEO Performance</h2>
          <p className="text-gray-600 text-sm mt-1">Track your SEO improvements over time</p>
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
            <option value="all">All time</option>
          </select>
          <button
            onClick={fetchPerformanceData}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiRefreshCw className="text-lg" />
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Score</span>
            <FiTarget className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{currentScore}</span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>{Math.abs(percentage).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Organic Traffic</span>
            <FiBarChart2 className="text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {performanceData.reduce((sum, d) => sum + (d.organicTraffic || 0), 0)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total visits</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Impressions</span>
            <FiCalendar className="text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {performanceData.reduce((sum, d) => sum + (d.impressions || 0), 0).toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">Search appearances</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg CTR</span>
            <FiAward className="text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {performanceData.length > 0
              ? (performanceData.reduce((sum, d) => sum + (d.ctr || 0), 0) / performanceData.length).toFixed(1)
              : '0.0'}%
          </div>
          <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">SEO Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value}`, 'Score']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                name="SEO Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Issues Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Issues Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
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
              <Bar dataKey="errors" fill="#ef4444" name="Errors" />
              <Bar dataKey="warnings" fill="#f59e0b" name="Warnings" />
              <Bar dataKey="info" fill="#3b82f6" name="Info" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Chart */}
      {performanceData.some(d => d.organicTraffic || d.impressions) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Traffic & Impressions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="organicTraffic"
                stroke="#10b981"
                strokeWidth={2}
                name="Organic Traffic"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Impressions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SEOPerformanceDashboard;






