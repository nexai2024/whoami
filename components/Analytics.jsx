import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';

const { FiTrendingUp, FiUsers, FiDollarSign, FiEye, FiCalendar, FiDownload, FiFilter } = FiIcons;

const Analytics = ({ data, pages = [], selectedPageId = 'all', onPageChange, loading = false }) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Use real data or show defaults when loading/no data
  const stats = data ? [
    { 
      label: 'Total Views', 
      value: data.totals.pageViews?.toLocaleString() || '0', 
      change: data.changes?.pageViews || '0%', 
      icon: FiEye, 
      color: 'blue' 
    },
    { 
      label: 'Unique Visitors', 
      value: data.totals.uniqueVisitors?.toLocaleString() || '0', 
      change: data.changes?.uniqueVisitors || '0%', 
      icon: FiUsers, 
      color: 'purple' 
    },
    { 
      label: 'Total Clicks', 
      value: data.totals.totalClicks?.toLocaleString() || '0', 
      change: data.changes?.totalClicks || '0%', 
      icon: FiTrendingUp, 
      color: 'green' 
    },
    { 
      label: 'Revenue', 
      value: `$${data.totals.revenue?.toFixed(2) || '0.00'}`, 
      change: data.changes?.revenue || '0%', 
      icon: FiDollarSign, 
      color: 'orange' 
    }
  ] : [];

  // Prepare chart data from real daily data
  const chartData = data?.daily || [];
  const chartLabels = chartData.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  const chartValues = chartData.map(d => d.totalClicks || d.clicks || 0);

  // Top performing blocks - use real data or show empty
  const topLinks = data?.topBlocks || [];

  const chartOptions = {
    title: {
      text: 'Clicks Over Time',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: {
        color: '#374151'
      }
    },
    xAxis: {
      type: 'category',
      data: chartLabels.length > 0 ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: [
      {
        name: 'Clicks',
        data: chartValues.length > 0 ? chartValues : [420, 532, 601, 734, 890, 1230, 1100],
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#6366f1',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#6366f1'
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const deviceChartOptions = {
    title: {
      text: 'Traffic by Device',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Device Type',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 65, name: 'Mobile', itemStyle: { color: '#6366f1' } },
          { value: 28, name: 'Desktop', itemStyle: { color: '#8b5cf6' } },
          { value: 7, name: 'Tablet', itemStyle: { color: '#ec4899' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <SafeIcon icon={FiDownload} />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <SafeIcon icon={stat.icon} className={`text-${stat.color}-600 text-xl`} />
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Clicks Chart */}
          <motion.div 
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <ReactECharts option={chartOptions} style={{ height: '400px' }} />
          </motion.div>

          {/* Device Breakdown */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <ReactECharts option={deviceChartOptions} style={{ height: '400px' }} />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Links */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Performing Links</h2>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <SafeIcon icon={FiFilter} />
                Filter
              </button>
            </div>
            
            <div className="space-y-4">
              {topLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{link.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{link.clicks} clicks</span>
                      <span>CTR: {link.ctr}</span>
                      <span className="text-green-600 font-medium">{link.revenue}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Insights & Recommendations</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <SafeIcon icon={FiTrendingUp} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Peak Engagement Time</h3>
                    <p className="text-sm text-gray-600">Your audience is most active between 7-9 PM. Consider scheduling new links during this time.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <SafeIcon icon={FiUsers} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Audience Growth</h3>
                    <p className="text-sm text-gray-600">Your mobile traffic increased 34% this week. Optimize your page layout for mobile users.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <SafeIcon icon={FiDollarSign} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Revenue Opportunity</h3>
                    <p className="text-sm text-gray-600">Add a tip jar to your page. Similar creators see 15% revenue increase.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;