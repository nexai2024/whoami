'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@stackframe/stack";
import { FiUsers, FiTrendingUp, FiDollarSign, FiCheckCircle, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CourseAnalyticsPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseAnalyticsPage({ params }: CourseAnalyticsPageProps) {
  const user = useUser();
  const { courseId } = params;
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, courseId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/analytics`, {
        headers: {
          'x-user-id': user?.id || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 403) {
        toast.error('You do not have permission to view this course analytics');
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to view course analytics.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.enrollmentCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <FiUsers className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No enrollment data yet</h2>
            <p className="text-gray-600 mb-6">
              Analytics will appear here once students start enrolling in your course.
            </p>
            <Link
              href={`/courses/${courseId}/edit`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Edit Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Enrollments',
      value: analytics.enrollmentCount.toLocaleString(),
      icon: FiUsers,
      color: 'blue'
    },
    {
      label: 'Completion Rate',
      value: `${analytics.completionRate.toFixed(1)}%`,
      icon: FiCheckCircle,
      color: 'green'
    },
    {
      label: 'Average Progress',
      value: `${analytics.averageProgress.toFixed(1)}%`,
      icon: FiTrendingUp,
      color: 'purple'
    },
    {
      label: 'Revenue',
      value: `$${analytics.revenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'yellow'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${courseId}/edit`}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Course Analytics</h1>
          <p className="text-gray-600 mt-1">{analytics.courseTitle}</p>
        </div>

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
                  <stat.icon className={`text-${stat.color}-600 text-xl`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Lesson Breakdown */}
        {analytics.lessonBreakdown && analytics.lessonBreakdown.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Lesson Completion</h2>
            <div className="space-y-4">
              {analytics.lessonBreakdown.map((lesson: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{lesson.title}</span>
                      <span className="text-sm text-gray-600">
                        {lesson.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${lesson.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {lesson.completedCount} / {analytics.enrollmentCount}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
