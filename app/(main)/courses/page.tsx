'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPlus, FiEdit3, FiUsers, FiClock, FiEye, FiBarChart2, FiBook, FiSettings } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { useAuth } from '@/lib/auth/AuthContext.jsx';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  status: string;
  accessType: string;
  price?: number;
  isLeadMagnet: boolean;
  coverImageUrl?: string;
  estimatedTime?: number;
  lessons: any[];
  _count: {
    enrollments: number;
    reviews: number;
  };
  createdAt: string;
}

const CoursesPage = () => {
  const { currUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (currUser) {
      loadCourses();
    }
  }, [currUser, filter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
      }

      const response = await fetch(`/api/courses?${params.toString()}`, {
        headers: {
          'x-user-id': currUser.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.DRAFT}`}>
        {status.toLowerCase()}
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'bg-blue-100 text-blue-800',
      INTERMEDIATE: 'bg-purple-100 text-purple-800',
      ADVANCED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors.BEGINNER}`}>
        {level.toLowerCase()}
      </span>
    );
  };

  if (!currUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
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

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter.toUpperCase();
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
                <div className="p-3 bg-blue-100 rounded-xl">
                  <SafeIcon name={undefined}  icon={FiBook} className="text-blue-600 text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Micro-Courses</h1>
              </div>
              <p className="text-gray-600">
                Create and manage educational content and lead magnets
              </p>
            </div>
            <Link
              href="/courses/new"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiPlus}  />
              Create New Course
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
            All Courses
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'published'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Published
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

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <SafeIcon name={undefined}  icon={FiBook} className="text-gray-400 text-6xl mx-auto mb-4"  />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first micro-course to use as a lead magnet or educational content
            </p>
            <Link
              href="/courses/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiPlus}  />
              Create Your First Course
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SafeIcon name={undefined}  icon={FiBook} className="text-white text-6xl opacity-50"  />
                    </div>
                  )}
                  {course.isLeadMagnet && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Lead Magnet
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(course.status)}
                    {getLevelBadge(course.level)}
                    {course.accessType === 'PAID' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ${course.price}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <SafeIcon name={undefined}  icon={FiBook} className="text-xs"  />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SafeIcon name={undefined}  icon={FiUsers} className="text-xs"  />
                      <span>{course._count?.enrollments || 0} enrolled</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/courses/${course.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <SafeIcon name={undefined}  icon={FiEdit3}  />
                      Edit
                    </Link>
                    <Link
                      href={`/courses/${course.id}/analytics`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors border rounded-lg"
                      title="View Analytics"
                    >
                      <SafeIcon name={undefined}  icon={FiBarChart2}  />
                    </Link>
                    <Link
                      href={`/c/${course.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors border rounded-lg"
                      title="View Course"
                    >
                      <SafeIcon name={undefined}  icon={FiEye}  />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
