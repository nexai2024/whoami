"use client"
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { PageService } from '../lib/database/pages';
import { AnalyticsService } from '../lib/services/analyticsService';
import { logger } from '../lib/utils/logger';
import SEOHead from './SEOHead';
import EmailCaptureModal from './EmailCaptureModal';
import BlockRenderer from './BlockRenderer';
import toast from 'react-hot-toast';

const {
  FiExternalLink, FiShoppingBag, FiMail, FiImage, FiMusic, FiVideo, 
  FiCalendar, FiLink, FiDollarSign, FiShare2, FiMapPin, FiBuilding, 
  FiPhone, FiGlobe, FiInstagram, FiTwitter, FiLinkedin, FiFacebook, FiYoutube
} = FiIcons;

const EnhancedPublicPage = ({ subdomain, slug }) => {
  // Get parameters from props or useParams
  const params = useParams();
  // In subdomain routing, the subdomain IS the slug
  const pageSlug = useMemo(() => 
    slug || subdomain || params.slug || params.subdomain, 
    [slug, subdomain, params.slug, params.subdomain]
  );
  
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const getVisitorIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }, []);

  const getDeviceType = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }, []);

  const getBrowserName = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }, []);

  const getOSName = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }, []);

  const recordPageView = useCallback(async (pageId) => {
    try {
      const visitorData = {
        pageId,
        ipAddress: await getVisitorIP(),
        userAgent: navigator.userAgent,
        referer: document.referrer,
        device: getDeviceType(),
        browser: getBrowserName(),
        os: getOSName()
      };
      await AnalyticsService.recordClick(visitorData);
    } catch (err) {
      logger.error('Error recording page view:', err);
    }
  }, [getVisitorIP, getDeviceType, getBrowserName, getOSName]);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!pageSlug) {
        throw new Error('No page slug provided');
      }
      
      const pageData = await PageService.getPageBySlug(pageSlug);
      
      if (!pageData) {
        throw new Error('Page not found');
      }
      console.log('pageData', pageData);
      setPage(pageData);
      
      // Record page view asynchronously without blocking UI
      recordPageView(pageData.id).catch(err => {
        logger.error('Error recording page view:', err);
      });
      
    } catch (err) {
      logger.error('Error loading public page:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load page';
      if (err.message?.includes('not found') || err.status === 404) {
        errorMessage = 'Page not found';
      } else if (err.message?.includes('network') || err.name === 'NetworkError') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pageSlug, recordPageView]);

  useEffect(() => {
    if (pageSlug) {
      loadPage();
    }
  }, [pageSlug, loadPage]);

  const handleBlockClick = useCallback(async (block) => {
    try {
      const clickData = {
        pageId: page.id,
        blockId: block.id,
        ipAddress: await getVisitorIP(),
        userAgent: navigator.userAgent,
        referer: document.referrer,
        device: getDeviceType(),
        browser: getBrowserName(),
        os: getOSName()
      };
      await AnalyticsService.recordClick(clickData);

      if (block.type === 'LINK' && block.url) {
        window.open(block.url, '_blank', 'noopener,noreferrer');
      } else if (block.type === 'PRODUCT') {
        handleProductPurchase(block);
      } else if (block.type === 'COURSE') {
        // Redirect to course landing page
        const courseSlug = block.data?.courseSlug || block.data?.slug;
        if (courseSlug) {
          window.location.href = `/c/${courseSlug}`;
        } else {
          toast.error('Course link not configured');
        }
      } else if (block.type === 'EMAIL_CAPTURE' || block.type === 'NEWSLETTER' || block.type === 'WAITLIST') {
        handleEmailCapture(block);
      }
    } catch (err) {
      logger.error('Error handling block click:', err);
    }
  }, [page?.id, getVisitorIP, getDeviceType, getBrowserName, getOSName]);

  const handleProductPurchase = useCallback((block) => {
    window.open(`/checkout/${block.id}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleEmailCapture = useCallback((block) => {
    setSelectedBlock(block);
    setShowEmailModal(true);
  }, []);

  const shareUrl = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShareMenuOpen(false);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      logger.error('Error copying to clipboard:', err);
      toast.error('Failed to copy link');
    }
  }, []);


  // Memoized components for better performance
  const LoadingSpinner = memo(() => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading page...</p>
      </div>
    </div>
  ));

  const ErrorState = memo(({ error }) => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error === 'Page not found' ? 'Page Not Found' : 'Error Loading Page'}
        </h1>
        <p className="text-gray-600 mb-6">
          {error === 'Page not found' 
            ? 'The page you\'re looking for doesn\'t exist.' 
            : error || 'Something went wrong. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  ));

  // Memoized profile header component
  const ProfileHeader = memo(({ user, shareMenuOpen, setShareMenuOpen, shareUrl }) => (
    <motion.div
      className="text-center mb-8 p-6 bg-white rounded-2xl shadow-sm"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
        {user?.profile?.avatar ? (
          <img
            src={user.profile.avatar}
            alt={user.profile.displayName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-white text-2xl font-bold">
            {user?.profile?.displayName?.charAt(0) || user.profile?.username?.charAt(0) || 'U'}
          </span>
        )}
      </div>
      
      <h1 className="text-2xl font-bold mb-2">
        {user?.profile?.displayName || user.profile?.username}
      </h1>
      
      {user.profile?.bio && (
        <p className="text-gray-600 mb-4">{user.profile.bio}</p>
      )}

      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Share this page"
          >
            <SafeIcon name={undefined} icon={FiShare2} />
            Share
          </button>
          {shareMenuOpen && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-10">
              <button
                onClick={shareUrl}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-700"
                aria-label="Copy link to clipboard"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ));

  // Memoized footer component
  const Footer = memo(() => (
    <motion.div
      className="text-center mt-12 pt-8 border-t border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <p className="text-sm text-gray-500 mb-4">
        Made with ❤️ using WhoAmI
      </p>
      <a
        href="https://whoami.bio"
        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Create your own page on WhoAmI"
      >
        Create your own page →
      </a>
    </motion.div>
  ));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      {page && (
        <>
          <SEOHead
            title={page.metaTitle || page.title || `${page.user?.profile?.displayName || page.user?.profile?.username}'s Page`}
            description={page.metaDescription || page.description || `Visit ${page.user?.profile?.displayName || page.user?.profile?.username}'s page`}
            ogImage={page.ogImage || page.user?.profile?.avatar}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            keywords={page.metaKeywords}
            author={page.user?.profile?.displayName || page.user?.profile?.username}
          />
          <div
            className="min-h-screen py-8 px-4 flex flex-col items-center justify-center"
            style={{
              backgroundColor: page.backgroundColor || '#f8fafc',
              color: page.textColor || '#1f2937',
              fontFamily: page.fontFamily || 'Inter, sans-serif'
            }}
          >
            <div className="w-full max-w-md mx-auto text-center">
              {page.user && (
                <ProfileHeader 
                  user={page.user} 
                  shareMenuOpen={shareMenuOpen} 
                  setShareMenuOpen={setShareMenuOpen} 
                  shareUrl={shareUrl} 
                />
              )}
              {/* Blocks */}
              <div className="space-y-4 text-center" role="main" aria-label="Page content">
                {page.blocks && page.blocks.length > 0 ? (
                  page.blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      role="article"
                      aria-label={`Block: ${block.title || block.type}`}
                    >
                      <BlockRenderer block={block} onBlockClick={handleBlockClick} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No content blocks available</p>
                  </div>
                )}
              </div>

              <Footer />
            </div>
          </div>

          {/* Email Capture Modal */}
          {showEmailModal && selectedBlock && (
            <EmailCaptureModal
              block={selectedBlock}
              pageId={page.id}
              onClose={() => {
                setShowEmailModal(false);
                setSelectedBlock(null);
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default memo(EnhancedPublicPage);