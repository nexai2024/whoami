'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCalendar, FiShoppingBag, FiMail, FiUser, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CoachBioPageProps {
  params: {
    coachSlug: string;
  };
}

export default function CoachBioPage({ params }: CoachBioPageProps) {
  const { coachSlug } = params;
  const router = useRouter();
  const [coach, setCoach] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoachData();
  }, [coachSlug]);

  const loadCoachData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coaches/${coachSlug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Coach not found');
        } else {
          setError('Failed to load coach profile');
        }
        return;
      }

      const data = await response.json();
      setCoach(data.coach);
      setProducts(data.products || []);
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error loading coach:', err);
      setError('Failed to load coach profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    router.push(`/book/${coachSlug}`);
  };

  const handleBuyClick = (productId?: string) => {
    if (productId) {
      router.push(`/checkout/${productId}`);
    } else {
      // Scroll to products section or show product list
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coach profile...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coach Not Found</h1>
          <p className="text-gray-600">{error || 'The coach profile you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {coach.avatar ? (
                <img
                  src={coach.avatar}
                  alt={coach.displayName || coach.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {(coach.displayName || coach.username)?.charAt(0).toUpperCase() || 'C'}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {coach.displayName || coach.username}
              </h1>
              {coach.bio && (
                <p className="text-gray-600 text-lg mb-6">{coach.bio}</p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {coach.bookingEnabled && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBookClick}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    <FiCalendar className="w-5 h-5" />
                    Book a Session
                  </motion.button>
                )}

                {coach.productsEnabled && products.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuyClick()}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    View Products
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        {products.length > 0 && (
          <motion.div
            id="products"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Products & Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleBuyClick(product.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Courses Section */}
        {courses.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/c/${course.slug}`)}
                >
                  {course.coverImageUrl && (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600">
                        {course.accessType === 'FREE' ? 'Free' : `$${course.price?.toFixed(2)}`}
                      </span>
                      <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                        View Course →
                      </span>
                    </div>
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
