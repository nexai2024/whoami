"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiSearch, FiFilter, FiStar, FiClock, FiUsers, FiBookOpen } = FiIcons;

export default function CourseMarketplacePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    accessType: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        sortBy: filters.sortBy
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.accessType) params.append('accessType', filters.accessType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/courses/public?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0
        }));
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCourses();
  };

  const formatPrice = (price: any, currency: string = 'USD') => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(Number(price));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Marketplace</h1>
          <p className="text-gray-600">Discover and enroll in courses from expert instructors</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Business">Business</option>
              <option value="Technology">Technology</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Health">Health</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels</option>
            </select>

            <select
              value={filters.accessType}
              onChange={(e) => setFilters(prev => ({ ...prev, accessType: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="EMAIL_GATE">Email Gate</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <FiBookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/c/${course.slug}`)}
                >
                  {/* Course Image */}
                  {course.coverImageUrl && (
                    <div className="aspect-video w-full bg-gray-200">
                      <Image 
                        src={course.coverImageUrl}
                        alt={course.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category and Price */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-600 uppercase">
                        {course.category || 'Course'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(course.price, course.currency)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Instructor */}
                    {course.user?.profile && (
                      <div className="flex items-center gap-2 mb-4">
                        {course.user.profile.avatar && (
                          <Image 
                            src={course.user.profile.avatar}
                            alt={course.user.profile.displayName || course.user.profile.username}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-600">
                          {course.user.profile.displayName || course.user.profile.username}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {course.enrollmentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <FiUsers size={16} />
                          <span>{course.enrollmentCount}</span>
                        </div>
                      )}
                      {course.averageRating && (
                        <div className="flex items-center gap-1">
                          <FiStar size={16} className="text-yellow-400 fill-current" />
                          <span>{Number(course.averageRating).toFixed(1)}</span>
                        </div>
                      )}
                      {course.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <FiClock size={16} />
                          <span>{course.estimatedTime} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
