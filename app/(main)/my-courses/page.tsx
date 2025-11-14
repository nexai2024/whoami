'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@stackframe/stack";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiBook, FiClock, FiCheckCircle, FiTrendingUp, FiPlay, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  level: string;
  estimatedTime?: number;
  progressPercentage: number;
  completedAt?: string;
  lastAccessedAt?: string;
  course: {
    title: string;
    slug: string;
    coverImageUrl?: string;
    level: string;
    estimatedTime?: number;
  };
}

export default function MyCoursesPage() {
  const user = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadEnrolledCourses();
    }
  }, [user, filter]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/my-courses`, {
        headers: {
          'x-user-id': user?.id || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.enrollments || []);
      } else {
        toast.error('Failed to load your courses');
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = enrolledCourses.filter(enrollment => {
    if (filter === 'completed') return enrollment.completedAt;
    if (filter === 'in-progress') return !enrollment.completedAt;
    return true;
  });

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'bg-blue-100 text-blue-800',
      INTERMEDIATE: 'bg-purple-100 text-purple-800',
      ADVANCED: 'bg-red-100 text-red-800',
      ALL_LEVELS: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors.ALL_LEVELS}`}>
        {level.replace('_', ' ').toLowerCase()}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to view your courses.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Summary */}
        {enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FiBook className="text-indigo-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</span>
              </div>
              <p className="text-gray-600 text-sm">Total Enrolled</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="text-blue-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(e => !e.completedAt).length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">In Progress</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FiAward className="text-green-600" size={24} />
                <span className="text-2xl font-bold text-gray-900">
                  {enrolledCourses.filter(e => e.completedAt).length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">Completed</p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <FiBook className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No courses enrolled yet' : `No ${filter.replace('-', ' ')} courses`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start learning by enrolling in a course'
                : `You don't have any ${filter.replace('-', ' ')} courses at the moment`}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((enrollment, idx) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                  {enrollment.course.coverImageUrl ? (
                    <Image 
                      src={enrollment.course.coverImageUrl}
                      alt={enrollment.course.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FiBook className="text-white text-5xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between text-white text-xs mb-1">
                      <span>{enrollment.progressPercentage}% Complete</span>
                      <span>{Math.round(enrollment.progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  {enrollment.completedAt && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <FiCheckCircle size={14} />
                      Completed
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {getLevelBadge(enrollment.course.level)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {enrollment.course.title}
                  </h3>
                  
                  {enrollment.course.estimatedTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <FiClock size={16} />
                      <span>{enrollment.course.estimatedTime} min</span>
                    </div>
                  )}

                  {enrollment.lastAccessedAt && (
                    <p className="text-xs text-gray-500 mb-4">
                      Last accessed {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/c/${enrollment.course.slug}/learn`}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <FiPlay size={18} />
                    {enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

