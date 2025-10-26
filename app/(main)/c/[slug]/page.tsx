'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@stackframe/stack";
import { useRouter } from 'next/navigation';
import { FiBook, FiClock, FiAward, FiCheckCircle, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CourseLandingPageProps {
  params: {
    slug: string;
  };
}

export default function CourseLandingPage({ params }: CourseLandingPageProps) {
  const { slug } = params;
  const user = useUser();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadCourse();
  }, [slug, user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/slug/${slug}`, {
        headers: user ? { 'x-user-id': user.id } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        toast.error('Course not found');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please log in to enroll');
      router.push('/login');
      return;
    }

    if (course.accessType === 'PAID') {
      handlePurchase();
      return;
    }

    try {
      setEnrolling(true);
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ email: course.accessType === 'EMAIL_GATE' ? email : undefined })
      });

      if (response.ok) {
        toast.success('Successfully enrolled!');
        router.push(`/c/${slug}/learn`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setEnrolling(true);
      const response = await fetch(`/api/courses/${course.id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <p className="text-gray-600">This course may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border p-8 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* Cover Image */}
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-6 flex items-center justify-center">
              <FiBook className="text-white text-6xl" />
            </div>
          )}

          {/* Title and Metadata */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.description}</p>

              {/* Course Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  <FiAward size={16} />
                  {course.level}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <FiBook size={16} />
                  {course.lessons?.length || 0} Lessons
                </span>
                {course.estimatedTime && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    <FiClock size={16} />
                    {course.estimatedTime} min
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                {course.accessType === 'FREE' && (
                  <span className="text-3xl font-bold text-green-600">FREE</span>
                )}
                {course.accessType === 'PAID' && (
                  <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                )}
                {course.accessType === 'EMAIL_GATE' && (
                  <span className="text-3xl font-bold text-indigo-600">Free with Email</span>
                )}
              </div>
            </div>
          </div>

          {/* Enrollment CTA */}
          <div className="border-t pt-6">
            {course.isEnrolled ? (
              <button
                onClick={() => router.push(`/c/${slug}/learn`)}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2"
              >
                <FiCheckCircle size={24} />
                Continue Learning
              </button>
            ) : (
              <>
                {course.accessType === 'EMAIL_GATE' && (
                  <div className="mb-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || (course.accessType === 'EMAIL_GATE' && !email)}
                  className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Processing...' : (
                    course.accessType === 'PAID' ? `Buy Course - $${course.price}` :
                    course.accessType === 'EMAIL_GATE' ? 'Get Free Access' :
                    'Enroll Now (Free)'
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Lesson Preview */}
        {course.lessons && course.lessons.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-sm border p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            <div className="space-y-4">
              {course.lessons.slice(0, 5).map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {lesson.isFree || course.isEnrolled ? (
                      <FiCheckCircle className="text-green-500" size={20} />
                    ) : (
                      <FiLock className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>
              ))}
              {course.lessons.length > 5 && (
                <p className="text-center text-gray-600 text-sm">
                  + {course.lessons.length - 5} more lessons
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
