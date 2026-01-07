'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiInstagram,
  FiYoutube,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
  FiTwitch,
  FiMessageSquare,
  FiGlobe,
  FiExternalLink,
  FiCalendar,
  FiShoppingBag,
  FiBook,
  FiMail,
  FiDownload,
  FiPlay,
  FiLink,
  FiUser,
  FiMapPin
} from 'react-icons/fi';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CreatorBioPageProps {
  params: Promise<{
    username: string;
  }>;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: any;
  color: string;
}

const SOCIAL_PLATFORMS = {
  twitter: {
    icon: FiTwitter,
    color: 'bg-black hover:bg-gray-800',
    gradient: 'from-gray-900 to-black'
  },
  instagram: {
    icon: FiInstagram,
    color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90',
    gradient: 'from-purple-600 via-pink-600 to-orange-500'
  },
  youtube: {
    icon: FiYoutube,
    color: 'bg-red-600 hover:bg-red-700',
    gradient: 'from-red-600 to-red-700'
  },
  tiktok: {
    icon: FiExternalLink,
    color: 'bg-black hover:bg-gray-800',
    gradient: 'from-gray-900 to-black'
  },
  linkedin: {
    icon: FiLinkedin,
    color: 'bg-blue-600 hover:bg-blue-700',
    gradient: 'from-blue-600 to-blue-700'
  },
  facebook: {
    icon: FiFacebook,
    color: 'bg-blue-500 hover:bg-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  twitch: {
    icon: FiTwitch,
    color: 'bg-purple-600 hover:bg-purple-700',
    gradient: 'from-purple-600 to-purple-700'
  },
  discord: {
    icon: FiMessageSquare,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    gradient: 'from-indigo-600 to-indigo-700'
  }
};

export default function CreatorBioPage({ params }: CreatorBioPageProps) {
  const router = useRouter();
  const [username, setUsername] = React.useState<string>('');
  const [creator, setCreator] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [leadMagnets, setLeadMagnets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve params promise
  React.useEffect(() => {
    params.then(({ username: resolvedUsername }) => {
      setUsername(resolvedUsername);
    });
  }, [params]);

  useEffect(() => {
    if (username) {
      loadCreatorData();
    }
  }, [username]);

  const loadCreatorData = async () => {
    try {
      setLoading(true);

      // Try loading as a creator profile first
      const response = await fetch(`/api/creators/${username}`);

      if (!response.ok) {
        // Fallback to coach API
        const coachResponse = await fetch(`/api/coaches/${username}`);
        if (!coachResponse.ok) {
          if (response.status === 404 || coachResponse.status === 404) {
            setError('Creator not found');
          } else {
            setError('Failed to load creator profile');
          }
          return;
        }
        const coachData = await coachResponse.json();
        setCreator(coachData.coach);
        setProducts(coachData.products || []);
        setCourses(coachData.courses || []);
      } else {
        const data = await response.json();
        setCreator(data.creator);
        setSocialLinks(data.socialLinks || []);
        setProducts(data.products || []);
        setCourses(data.courses || []);
        setLeadMagnets(data.leadMagnets || []);
      }
    } catch (err) {
      console.error('Error loading creator:', err);
      setError('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleBookClick = () => {
    router.push(`/book/${username}`);
  };

  const handleProductClick = (productId: string) => {
    router.push(`/checkout/${productId}`);
  };

  const handleCourseClick = (courseSlug: string) => {
    router.push(`/c/${courseSlug}`);
  };

  const handleLeadMagnetClick = (leadMagnet: any) => {
    // Navigate to lead magnet page
    router.push(`/magnet/${leadMagnet.slug || leadMagnet.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Creator Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">
            {error || 'The creator profile you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const hasSocialLinks = socialLinks.length > 0;
  const hasProducts = products.length > 0;
  const hasCourses = courses.length > 0;
  const hasLeadMagnets = leadMagnets.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-6"
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
                {creator.avatar ? (
                  <Image
                    src={creator.avatar}
                    alt={creator.displayName || creator.username}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {(creator.displayName || creator.username)?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                )}
              </div>
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>

            {/* Name & Bio */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              {creator.displayName || creator.username}
            </motion.h1>

            {creator.bio && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg mb-4 max-w-md"
              >
                {creator.bio}
              </motion.p>
            )}

            {creator.location && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center text-gray-500 text-sm mb-4"
              >
                <FiMapPin className="w-4 h-4 mr-1" />
                {creator.location}
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6"
            >
              {courses.length > 0 && (
                <div className="flex items-center gap-1">
                  <FiBook className="w-4 h-4" />
                  <span>{courses.length} {courses.length === 1 ? 'Course' : 'Courses'}</span>
                </div>
              )}
              {products.length > 0 && (
                <div className="flex items-center gap-1">
                  <FiShoppingBag className="w-4 h-4" />
                  <span>{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
                </div>
              )}
            </motion.div>

            {/* Social Links */}
            {hasSocialLinks && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-3 mb-6"
              >
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSocialClick(social.url)}
                      className={`w-14 h-14 rounded-2xl ${social.color} text-white flex items-center justify-center shadow-lg transition-all hover:shadow-xl`}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* Primary CTAs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {creator.bookingEnabled && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all shadow-md"
                >
                  <FiCalendar className="w-5 h-5" />
                  Book a Session
                </motion.button>
              )}

              {creator.productsEnabled && products.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all shadow-md"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  Shop Products
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Lead Magnets Section */}
        {hasLeadMagnets && (
          <motion.div
            id="lead-magnets"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiDownload className="w-6 h-6 text-indigo-600" />
              Free Resources
            </h2>
            <div className="space-y-4">
              {leadMagnets.slice(0, 3).map((magnet, index) => (
                <motion.button
                  key={magnet.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  onClick={() => handleLeadMagnetClick(magnet)}
                  className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {magnet.title}
                      </h3>
                      {magnet.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{magnet.description}</p>
                      )}
                    </div>
                    <FiDownload className="w-5 h-5 text-indigo-600 ml-4 flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Featured Courses */}
        {hasCourses && (
          <motion.div
            id="courses"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiPlay className="w-6 h-6 text-indigo-600" />
              Featured Courses
            </h2>
            <div className="space-y-4">
              {courses.slice(0, 3).map((course, index) => (
                <motion.button
                  key={course.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  onClick={() => handleCourseClick(course.slug)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all text-left group"
                >
                  {course.coverImageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={course.coverImageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600">
                        {course.accessType === 'FREE' ? 'Free' : `$${course.price?.toFixed(2)}`}
                      </span>
                      <span className="text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Course <FiExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Section */}
        {hasProducts && (
          <motion.div
            id="products"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiShoppingBag className="w-6 h-6 text-indigo-600" />
              Products & Packages
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {products.slice(0, 3).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center py-8"
        >
          <p className="text-gray-500 text-sm mb-4">
            Create your own link-in-bio page
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <FiLink className="w-4 h-4" />
            Get Started Free
          </button>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
