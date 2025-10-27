"use client"
import React, { useState, useEffect } from 'react';
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
  const pageSlug = slug || subdomain || params.slug || params.subdomain;
  
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    console.log('EnhancedPublicPage - pageSlug:', pageSlug, 'subdomain:', subdomain, 'slug:', slug);
    if (pageSlug) {
      loadPage();
    }
  }, [pageSlug]);

  const loadPage = async () => {
    try {
      console.log('Loading page with slug:', pageSlug);
      setLoading(true);
      const pageData = await PageService.getPageBySlug(pageSlug);
      setPage(pageData);
      console.log('Page data loaded:', pageData);
      await recordPageView(pageData.id);
    } catch (err) {
      logger.error('Error loading public page:', err);
      console.error('Error loading public page:', err); 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recordPageView = async (pageId) => {
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
      console.log('Recording page view:', visitorData);
      await AnalyticsService.recordClick(visitorData);
    } catch (err) {
      logger.error('Error recording page view:', err);
    }
  };  

  const getVisitorIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getOSName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  };

  const handleBlockClick = async (block) => {
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
      } else if (block.type === 'EMAIL_CAPTURE' || block.type === 'NEWSLETTER' || block.type === 'WAITLIST') {
        handleEmailCapture(block);
      }
    } catch (err) {
      logger.error('Error handling block click:', err);
    }
  };

  const handleProductPurchase = (block) => {
    window.open(`/checkout/${block.id}`, '_blank');
  };

  const handleEmailCapture = (block) => {
    setSelectedBlock(block);
    setShowEmailModal(true);
  };

  const shareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareMenuOpen(false);
    toast.success('Link copied to clipboard!');
  };

  const getSocialIcon = (platform) => {
    const iconMap = {
      instagram: FiInstagram,
      twitter: FiTwitter,
      linkedin: FiLinkedin,
      facebook: FiFacebook,
      youtube: FiYoutube
    };
    return iconMap[platform] || FiGlobe;
  };

  const getBlockIcon = (type) => {
    const iconMap = {
      LINK: FiLink,
      PRODUCT: FiShoppingBag,
      EMAIL_CAPTURE: FiMail,
      IMAGE_GALLERY: FiImage,
      MUSIC_PLAYER: FiMusic,
      VIDEO_EMBED: FiVideo,
      BOOKING_CALENDAR: FiCalendar,
      TIP_JAR: FiDollarSign
    };
    return iconMap[type] || FiLink;
  };

  const getBlockStyles = (block) => {
    const baseStyles = "w-full p-4 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer";
    const colorStyles = {
      LINK: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
      PRODUCT: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
      EMAIL_CAPTURE: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700",
      TIP_JAR: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
    };
    return `${baseStyles} ${colorStyles[block.type] || colorStyles.LINK}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <a
            href="/"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={page.metaTitle || page.title}
        description={page.metaDescription || page.description}
        ogImage={page.ogImage}
        url={window.location.href}
      />
      <div
        className="min-h-screen py-8 px-4"
        style={{
          backgroundColor: page.backgroundColor || '#f8fafc',
          color: page.textColor || '#1f2937',
          fontFamily: page.fontFamily || 'Inter, sans-serif'
        }}
      >
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <motion.div
            className="text-center mb-8 p-6 bg-white rounded-2xl shadow-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              {page.user.profile?.avatar ? (
                <img
                  src={page.user.profile.avatar}
                  alt={page.user.profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {page.user.profile?.displayName?.charAt(0) || page.user.profile?.username?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              {page.user.profile?.displayName || page.user.profile?.username}
            </h1>
            
            {page.user.profile?.bio && (
              <p className="text-gray-600 mb-4">{page.user.profile.bio}</p>
            )}

            <div className="flex justify-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <SafeIcon name={undefined}  icon={FiShare2} />
                  Share
                </button>
                {shareMenuOpen && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-10">
                    <button
                      onClick={shareUrl}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-gray-700"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Blocks */}
          <div className="space-y-4">
            {page.blocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <BlockRenderer block={block} onBlockClick={handleBlockClick} />
              </motion.div>
            ))}
          </div>

          {/* Footer */}
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
            >
              Create your own page →
            </a>
          </motion.div>
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
  );
};

export default EnhancedPublicPage;