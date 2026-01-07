"use client"
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { PageService } from '../lib/database/pages';
import { AnalyticsService } from '../lib/services/analyticsService';
import { logger } from '../lib/utils/logger';
import SEOHead from './SEOHead';
import EmailCaptureModal from './EmailCaptureModal';
import PasswordModal from './PasswordModal';
import ContactFormModal from './ContactFormModal';
import AMAModal from './AMAModal';
import QRCodeShare from './QRCodeShare';
import BlockRenderer from './BlockRenderer';
import toast from 'react-hot-toast';
import { getThemeById, getDefaultTheme, getThemeCSSVariables } from '../lib/themes/themePresets';
import { getFontById, getFontFamilyCSS, getGoogleFontsURL } from '../lib/themes/fonts';
import DOMPurify from 'isomorphic-dompurify';
import { isRichTextEmpty } from '../lib/utils/richText';
import { generatePageSchema } from '../lib/seo/pageSchemaGenerator';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAMAModal, setShowAMAModal] = useState(false);
  const [unlockedBlocks, setUnlockedBlocks] = useState(new Set());

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
      console.log('Theme data:', pageData.theme);
      console.log('Typography data:', pageData.typography);
      console.log('Layout data:', pageData.layout);
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

  // Load unlocked blocks from localStorage on mount
  useEffect(() => {
    if (page?.id) {
      const stored = localStorage.getItem(`unlocked_blocks_${page.id}`);
      if (stored) {
        try {
          setUnlockedBlocks(new Set(JSON.parse(stored)));
        } catch (e) {
          logger.error('Error loading unlocked blocks:', e);
        }
      }
    }
  }, [page?.id]);

  // Save unlocked blocks to localStorage
  const saveUnlockedBlock = useCallback((blockId) => {
    if (!page?.id) return;
    const newUnlocked = new Set(unlockedBlocks);
    newUnlocked.add(blockId);
    setUnlockedBlocks(newUnlocked);
    localStorage.setItem(`unlocked_blocks_${page.id}`, JSON.stringify(Array.from(newUnlocked)));
  }, [page?.id, unlockedBlocks]);

  // Define handlers before handleBlockClick to avoid initialization errors
  const handleProductPurchase = useCallback((block) => {
    window.open(`/checkout/${block.id}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleEmailCapture = useCallback((block) => {
    setSelectedBlock(block);
    setShowEmailModal(true);
  }, []);

  const handleGatedContent = useCallback((block) => {
    // Check if already unlocked
    if (unlockedBlocks.has(block.id)) {
      return;
    }

    const accessRequirement = block.data?.accessRequirement || 'email';
    
    if (accessRequirement === 'email') {
      // Use email capture modal
      setSelectedBlock(block);
      setShowEmailModal(true);
    } else if (accessRequirement === 'password') {
      // Show password input modal
      setSelectedBlock(block);
      setShowPasswordModal(true);
    } else if (accessRequirement === 'payment') {
      // Redirect to checkout
      const price = block.data?.price || 0;
      if (price > 0) {
        window.open(`/checkout/gated/${block.id}`, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Payment amount not configured');
      }
    } else if (accessRequirement === 'membership') {
      // Check membership (would need API call)
      toast.error('Membership check not yet implemented');
    }
  }, [unlockedBlocks]);

  const handleDeepLink = useCallback((block) => {
    try {
      const iosUrl = block.data?.iosUrl;
      const androidUrl = block.data?.androidUrl;
      const iosScheme = block.data?.iosScheme;
      const androidScheme = block.data?.androidScheme;
      const webUrl = block.data?.webUrl;
      const linkBehavior = block.data?.linkBehavior || 'smart';
      const openIn = block.data?.openIn || 'same_tab';

      // Detect platform
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = isIOS || isAndroid;

      // Determine target URL based on behavior
      let targetUrl = null;
      let schemeUrl = null;

      if (linkBehavior === 'web_only') {
        // Web only - ignore app links
        targetUrl = webUrl || iosUrl || androidUrl;
      } else if (linkBehavior === 'app_only') {
        // App only - use custom schemes
        if (isIOS && iosScheme) {
          schemeUrl = iosScheme;
        } else if (isAndroid && androidScheme) {
          schemeUrl = androidScheme;
        } else {
          // Fallback to universal/app links
          targetUrl = isIOS ? iosUrl : (isAndroid ? androidUrl : null);
        }
      } else {
        // Smart behavior - try app first, fallback to web
        if (isIOS) {
          // iOS: Try custom scheme first, then universal link, then web
          if (iosScheme) {
            schemeUrl = iosScheme;
          } else if (iosUrl) {
            targetUrl = iosUrl;
          } else {
            targetUrl = webUrl;
          }
        } else if (isAndroid) {
          // Android: Try custom scheme first, then app link, then web
          if (androidScheme) {
            schemeUrl = androidScheme;
          } else if (androidUrl) {
            targetUrl = androidUrl;
          } else {
            targetUrl = webUrl;
          }
        } else {
          // Desktop: Use web URL
          targetUrl = webUrl || iosUrl || androidUrl;
        }
      }

      // Open the link
      if (schemeUrl) {
        // Custom URL scheme - try to open app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = schemeUrl;
        document.body.appendChild(iframe);
        
        // Fallback to web after timeout if app doesn't open
        setTimeout(() => {
          document.body.removeChild(iframe);
          if (targetUrl && linkBehavior === 'smart') {
            if (openIn === 'new_tab') {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = targetUrl;
            }
          }
        }, 2500);
      } else if (targetUrl) {
        // Regular URL - universal link, app link, or web
        if (openIn === 'new_tab') {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = targetUrl;
        }
      } else {
        toast.error('Deep link not configured');
      }
    } catch (err) {
      logger.error('Error handling deep link:', err);
      toast.error('Failed to open link');
    }
  }, []);

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

      if (block.type === 'LINK') {
        const url = block.data?.url || block.url;
        if (url) {
          const openInNewTab = block.data?.openInNewTab !== false;
          if (openInNewTab) {
            window.open(url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = url;
          }
        }
      } else if (block.type === 'DEEP_LINK') {
        handleDeepLink(block);
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
      } else if (block.type === 'GATED_CONTENT') {
        handleGatedContent(block);
      } else if (block.type === 'AMA_BLOCK') {
        setSelectedBlock(block);
        setShowAMAModal(true);
      } else if (block.type === 'BOOKING_CALENDAR') {
        const calendarUrl = block.data?.calendarUrl;
        if (calendarUrl) {
          window.open(calendarUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('Calendar URL not configured');
        }
      } else if (block.type === 'TIP_JAR') {
        window.open(`/checkout/tip/${block.id}`, '_blank', 'noopener,noreferrer');
      } else if (block.type === 'CONTACT_FORM') {
        setSelectedBlock(block);
        setShowContactModal(true);
      } else if (block.type === 'PORTFOLIO') {
        const liveUrl = block.data?.liveUrl || block.data?.caseStudyUrl;
        if (liveUrl) {
          window.open(liveUrl, '_blank', 'noopener,noreferrer');
        }
      } else if (block.type === 'SOCIAL_SHARE') {
        // Handle social sharing
        const shareUrl = block.data?.shareUrl || window.location.href;
        const shareText = block.data?.shareText || block.title || 'Check this out!';
        if (navigator.share) {
          navigator.share({
            title: block.title,
            text: shareText,
            url: shareUrl
          }).catch(() => {
            // Fallback to copying URL
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
          });
        } else {
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        }
      }
    } catch (err) {
      logger.error('Error handling block click:', err);
    }
  }, [page?.id, getVisitorIP, getDeviceType, getBrowserName, getOSName, handleProductPurchase, handleEmailCapture, handleGatedContent, handleDeepLink]);

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
  const ProfileHeader = memo(
    ({ headerData, user, shareMenuOpen, setShareMenuOpen, shareUrl, headingFontFamily, pageLoadAnimation, themeColors }) => {
      const data = headerData ?? {};
      const avatar =
        data.logoUrl ||
        data.avatar ||
        user?.profile?.avatar ||
        null;

      const displayName =
        data.displayName ||
        user?.profile?.displayName ||
        user?.profile?.username ||
        'Creator';

      const title = data.title || null;
      const company = data.company || null;
      const bio =
        data.bio ||
        user?.profile?.bio ||
        null;

      const location =
        data.showLocation && data.location ? data.location : null;

      const initials =
        displayName?.trim()?.charAt(0)?.toUpperCase() ||
        user?.profile?.username?.trim()?.charAt(0)?.toUpperCase() ||
        'U';

      const showContact =
        data.showContactInfo &&
        (data.email || data.phone || data.website);

      const socialEntries = data.showSocialLinks && data.socialLinks
        ? Object.entries(data.socialLinks).filter(
            ([, url]) => typeof url === 'string' && url.trim().length > 0
          )
        : [];

      const containerClasses = (() => {
        const base = 'relative mb-8 p-6 rounded-2xl transition-all';
        const styleMap = {
          minimal: 'shadow-sm',
          card: 'border shadow-md',
          gradient: 'shadow-lg',
          split: 'border shadow-sm',
        };
        return `${base} ${styleMap[data.headerStyle] || styleMap.minimal}`;
      })();
      
      // Get container styles based on theme and header style
      const getContainerStyles = () => {
        const baseStyles = {
          backgroundColor: themeColors?.surface || '#FFFFFF',
          color: themeColors?.text || '#111827',
          borderColor: themeColors?.border || '#E5E7EB',
        };
        
        if (data.headerStyle === 'gradient') {
          // For gradient, use primary and secondary colors
          return {
            background: `linear-gradient(to right, ${themeColors?.primary || '#6366F1'}, ${themeColors?.secondary || '#8B5CF6'})`,
            color: '#FFFFFF',
          };
        }
        
        return baseStyles;
      };

      const isGradient = data.headerStyle === 'gradient';

      const contentLayoutClass =
        data.headerStyle === 'split'
          ? 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between'
          : 'text-center';

      const avatarWrapperClass =
        data.headerStyle === 'split'
          ? 'w-24 h-24 flex-shrink-0 md:w-28 md:h-28'
          : 'w-24 h-24 mx-auto';

      const getSocialIcon = (platform) => {
        const iconMap = {
          instagram: FiInstagram,
          twitter: FiTwitter,
          linkedin: FiLinkedin,
          facebook: FiFacebook,
          youtube: FiYoutube,
        };
        return iconMap[platform] || FiGlobe;
      };

      // Get animation props for header
      const getHeaderAnimationProps = () => {
        if (pageLoadAnimation === 'none') return {};
        switch (pageLoadAnimation) {
          case 'fade':
            return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 } };
          case 'slide-up':
            return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6 } };
          case 'zoom':
            return { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5 } };
          default:
            return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6 } };
        }
      };

      return (
        <motion.div
          className={containerClasses}
          style={getContainerStyles()}
          {...getHeaderAnimationProps()}
        >
          {data.backgroundImage && (
            <div
              className="absolute inset-0 rounded-2xl bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${data.backgroundImage})` }}
            />
          )}
          <div className="relative z-10">
            <div className={contentLayoutClass}>
              <div
                className={`${avatarWrapperClass} mb-4 rounded-full overflow-hidden flex items-center justify-center`}
                style={{
                  background: isGradient 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : `linear-gradient(to right, ${themeColors?.primary || '#6366F1'}, ${themeColors?.secondary || '#8B5CF6'})`
                }}
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {initials}
                  </span>
                )}
              </div>

              <div className={data.headerStyle === 'split' ? 'flex-1 text-left md:pl-6' : ''}>
                <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: headingFontFamily || 'inherit' }}>{displayName}</h1>
                {title && (
                  <p className="text-lg opacity-80 mb-2" style={{ color: isGradient ? '#FFFFFF' : (themeColors?.textSecondary || '#6B7280') }}>{title}</p>
                )}
                {company && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm mb-2 opacity-80" style={{ color: isGradient ? '#FFFFFF' : (themeColors?.textSecondary || '#6B7280') }}>
                    <SafeIcon name={undefined} icon={FiBuilding} />
                    <span>{company}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm mb-3 opacity-80" style={{ color: isGradient ? '#FFFFFF' : (themeColors?.textSecondary || '#6B7280') }}>
                    <SafeIcon name={undefined} icon={FiMapPin} />
                    <span>{location}</span>
                  </div>
                )}
                {!isRichTextEmpty(bio) && (
                  <div
                    className={`text-sm mb-4 max-w-xl mx-auto md:mx-0 ${isGradient ? 'opacity-95' : 'opacity-90'}`}
                    style={!isGradient ? { color: themeColors?.textSecondary || '#6B7280' } : {}}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bio || '') }}
                  />
                )}
                {!isRichTextEmpty(data.customIntroduction) && (
                  <div
                    className={`rounded-lg p-3 mb-4 text-sm font-medium ${
                      isGradient
                        ? 'bg-white bg-opacity-10'
                        : ''
                    }`}
                    style={!isGradient ? { backgroundColor: themeColors?.surface || '#F3F4F6' } : {}}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.customIntroduction || '') }}
                  />
                )}
                {showContact && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-sm" style={{ color: isGradient ? '#FFFFFF' : (themeColors?.textSecondary || '#6B7280') }}>
                    {data.email && (
                      <a
                        href={`mailto:${data.email}`}
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: isGradient ? '#FFFFFF' : (themeColors?.accent || themeColors?.primary || '#6366F1') }}
                      >
                        <SafeIcon name={undefined} icon={FiMail} />
                        {data.email}
                      </a>
                    )}
                    {data.phone && (
                      <a
                        href={`tel:${data.phone}`}
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: isGradient ? '#FFFFFF' : (themeColors?.accent || themeColors?.primary || '#6366F1') }}
                      >
                        <SafeIcon name={undefined} icon={FiPhone} />
                        {data.phone}
                      </a>
                    )}
                    {data.website && (
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: isGradient ? '#FFFFFF' : (themeColors?.accent || themeColors?.primary || '#6366F1') }}
                      >
                        <SafeIcon name={undefined} icon={FiGlobe} />
                        Website
                      </a>
                    )}
                  </div>
                )}
                {socialEntries.length > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    {socialEntries.map(([platform, url]) => {
                      const Icon = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                            isGradient
                              ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                              : ''
                          }`}
                          style={!isGradient ? {
                            backgroundColor: themeColors?.surface || 'rgba(0, 0, 0, 0.1)',
                            color: themeColors?.text || '#374151',
                          } : {}}
                          aria-label={`${displayName} on ${platform}`}
                        >
                          <SafeIcon name={undefined} icon={Icon} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isGradient
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : ''
                  }`}
                  style={!isGradient ? {
                    backgroundColor: themeColors?.surface || '#F3F4F6',
                    color: themeColors?.text || '#1F2937',
                  } : {}}
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
          </div>
        </motion.div>
      );
    }
  );

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

  const headerData = page?.pageHeader?.data ?? {};
  const resolvedDisplayName =
    headerData?.displayName ||
    page?.user?.profile?.displayName ||
    page?.user?.profile?.username ||
    null;
  const resolvedDescription =
    page?.metaDescription ||
    headerData?.customIntroduction ||
    page?.description ||
    (resolvedDisplayName ? `Visit ${resolvedDisplayName}'s page` : null);
  const resolvedOgImage =
    page?.ogImage ||
    headerData?.logoUrl ||
    page?.user?.profile?.avatar ||
    undefined;

  // Get theme from page settings or use default
  // Handle both string (JSON) and object formats
  let themeData = page?.theme;
  if (typeof themeData === 'string') {
    try {
      themeData = JSON.parse(themeData);
    } catch (e) {
      console.warn('Failed to parse theme JSON:', e);
      themeData = null;
    }
  }
  console.log('Processed themeData:', themeData);
  const themeId = themeData?.id || themeData?.name || (typeof themeData === 'string' ? themeData : null);
  console.log('Resolved themeId:', themeId);
  const theme = themeId ? getThemeById(themeId) : getDefaultTheme();
  console.log('Selected theme:', theme);
  const themeColors = theme?.colors || {
    primary: '#000000',
    secondary: '#666666',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    accent: '#000000',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.05)',
  };

  // Get typography settings
  // Handle both string (JSON) and object formats
  let typography = page?.typography || {};
  if (typeof typography === 'string') {
    try {
      typography = JSON.parse(typography);
    } catch (e) {
      console.warn('Failed to parse typography JSON:', e);
      typography = {};
    }
  }
  const fontId = typography.fontFamily || page?.fontFamily || 'inter';
  const headingFontId = typography.headingFont || fontId;
  const bodyFontId = typography.bodyFont || fontId;
  const font = getFontById(fontId);
  const headingFont = getFontById(headingFontId);
  const bodyFont = getFontById(bodyFontId);
  const fontFamily = font ? getFontFamilyCSS(font) : 'Inter, sans-serif';
  const headingFontFamily = headingFont ? getFontFamilyCSS(headingFont) : fontFamily;
  const bodyFontFamily = bodyFont ? getFontFamilyCSS(bodyFont) : fontFamily;
  
  // Typography CSS variables
  const typographyStyles = {
    '--font-family': fontFamily,
    '--heading-font-family': headingFontFamily,
    '--body-font-family': bodyFontFamily,
    '--font-weight': typography.fontWeight || '400',
    '--font-size': typography.fontSize === 'small' ? '0.875rem' :
                   typography.fontSize === 'large' ? '1.125rem' :
                   typography.fontSize === 'xl' ? '1.25rem' : '1rem',
    '--line-height': typography.lineHeight === 'tight' ? '1.2' :
                     typography.lineHeight === 'relaxed' ? '1.8' : '1.5',
    '--letter-spacing': typography.letterSpacing === 'tight' ? '-0.025em' :
                        typography.letterSpacing === 'wide' ? '0.025em' : '0',
  };
  
  // Get layout settings
  // Handle both string (JSON) and object formats
  let layout = page?.layout || {};
  if (typeof layout === 'string') {
    try {
      layout = JSON.parse(layout);
    } catch (e) {
      console.warn('Failed to parse layout JSON:', e);
      layout = {};
    }
  }
  const containerWidth = layout.containerWidth || 'md'; // md = max-w-md
  const spacing = layout.spacing || 'normal'; // normal = space-y-4
  const alignment = layout.alignment || 'center'; // center, left, right
  const padding = layout.padding || {};
  
  // Container width classes
  const containerWidthClasses = {
    narrow: 'max-w-xs',
    compact: 'max-w-sm',
    md: 'max-w-md',
    standard: 'max-w-lg',
    wide: 'max-w-xl',
    full: 'max-w-4xl',
  };
  
  // Spacing classes
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    comfortable: 'space-y-6',
    spacious: 'space-y-8',
  };
  
  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Get animation settings
  const animations = page?.animations || {};
  const pageLoadAnimation = animations.pageLoad || 'fade';
  const scrollAnimation = animations.scroll || 'none';
  const staggerDelay = animations.staggerDelay || 0.1;
  const microInteractions = animations.microInteractions || false;

  // Get animation props based on page load animation type
  const getPageLoadAnimationProps = (index = 0) => {
    if (pageLoadAnimation === 'none') return {};
    
    const delay = pageLoadAnimation === 'stagger' ? index * staggerDelay : 0;
    
    switch (pageLoadAnimation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay }
        };
      case 'slide-up':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6, delay }
        };
      case 'slide-down':
        return {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6, delay }
        };
      case 'zoom':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.5, delay }
        };
      case 'stagger':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6, delay }
        };
      default:
        return {};
    }
  };

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
          {(() => {
            // Generate schema markup automatically
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';
            const schemaData = generatePageSchema(page, baseUrl);
            
            return (
              <SEOHead
                title={
                  page.metaTitle ||
                  page.title ||
                  (resolvedDisplayName ? `${resolvedDisplayName}'s Page` : 'WhoAmI Page')
                }
                description={
                  resolvedDescription ||
                  'Discover this creator on WhoAmI.'
                }
                ogImage={resolvedOgImage}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                keywords={page.metaKeywords}
                author={resolvedDisplayName || undefined}
                schema={schemaData ? {
                  type: schemaData.type,
                  data: schemaData.schema
                } : undefined}
              />
            );
          })()}
          {/* Load Google Fonts if needed */}
          {(() => {
            const fontsToLoad = [];
            if (font?.googleFont) fontsToLoad.push(font);
            if (headingFont?.googleFont && headingFont.id !== font?.id) fontsToLoad.push(headingFont);
            if (bodyFont?.googleFont && bodyFont.id !== font?.id && bodyFont.id !== headingFont?.id) fontsToLoad.push(bodyFont);
            return fontsToLoad.length > 0 ? (
              <link
                href={getGoogleFontsURL(fontsToLoad)}
                rel="stylesheet"
              />
            ) : null;
          })()}
          
          <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{
              backgroundColor: themeColors.background || page.backgroundColor || '#FFFFFF',
              color: themeColors.text || page.textColor || '#111827',
              fontFamily: bodyFontFamily,
              fontSize: typographyStyles['--font-size'],
              fontWeight: typographyStyles['--font-weight'],
              lineHeight: typographyStyles['--line-height'],
              letterSpacing: typographyStyles['--letter-spacing'],
              paddingTop: padding.top ? `${padding.top}px` : '2rem',
              paddingBottom: padding.bottom ? `${padding.bottom}px` : '2rem',
              paddingLeft: padding.left ? `${padding.left}px` : '1rem',
              paddingRight: padding.right ? `${padding.right}px` : '1rem',
              ...getThemeCSSVariables(theme || getDefaultTheme()),
              ...typographyStyles,
            }}
          >
            <div 
              className={`w-full ${containerWidthClasses[containerWidth] || containerWidthClasses.md} mx-auto`}
              style={{ textAlign: alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center' }}
            >
              {(page.pageHeader || page.user) && (
                <ProfileHeader 
                  headerData={page.pageHeader?.data ?? {}}
                  user={page.user} 
                  shareMenuOpen={shareMenuOpen} 
                  setShareMenuOpen={setShareMenuOpen} 
                  shareUrl={shareUrl}
                  headingFontFamily={headingFontFamily}
                  pageLoadAnimation={pageLoadAnimation}
                  themeColors={themeColors}
                />
              )}
              {/* Blocks */}
              <div className={`${spacingClasses[spacing] || spacingClasses.normal} text-center`} role="main" aria-label="Page content">
                {page.blocks && page.blocks.length > 0 ? (
                  page.blocks.map((block, index) => {
                    try {
                      // Add unlocked state to gated content blocks
                      const blockWithUnlock = block.type === 'GATED_CONTENT' 
                        ? { ...block, data: { ...block.data, isUnlocked: unlockedBlocks.has(block.id) } }
                        : block;
                      return (
                        <motion.div
                          key={block.id || `block-${index}`}
                          {...getPageLoadAnimationProps(index)}
                          role="article"
                          aria-label={`Block: ${block.title || block.type || 'Unknown'}`}
                          {...(scrollAnimation === 'fade-on-scroll' ? {
                            whileInView: { opacity: 1 },
                            viewport: { once: true, margin: '-100px' },
                            initial: { opacity: 0 }
                          } : {})}
                          {...(scrollAnimation === 'slide-on-scroll' ? {
                            whileInView: { x: 0, opacity: 1 },
                            viewport: { once: true, margin: '-100px' },
                            initial: { x: index % 2 === 0 ? -50 : 50, opacity: 0 },
                            transition: { duration: 0.6 }
                          } : {})}
                        >
                          <BlockRenderer 
                            block={blockWithUnlock} 
                            onBlockClick={handleBlockClick}
                            themeColors={themeColors}
                          />
                        </motion.div>
                      );
                    } catch (blockError) {
                      logger.error('Error rendering block:', blockError, { blockId: block?.id, blockType: block?.type });
                      return (
                        <div key={block?.id || `error-${index}`} className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">Error loading block</p>
                        </div>
                      );
                    }
                  })
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
              pageType={page.type || 'PAGE'}
              ownerId={page.user?.id || page.userId}
              onClose={() => {
                setShowEmailModal(false);
                setSelectedBlock(null);
              }}
              onSuccess={(blockId) => {
                // If this is a gated content block, unlock it
                if (selectedBlock?.type === 'GATED_CONTENT') {
                  saveUnlockedBlock(blockId || selectedBlock.id);
                  toast.success('Content unlocked!');
                }
              }}
            />
          )}

          {/* Password Modal */}
          {showPasswordModal && selectedBlock && (
            <PasswordModal
              block={selectedBlock}
              onClose={() => {
                setShowPasswordModal(false);
                setSelectedBlock(null);
              }}
              onUnlock={(blockId) => {
                saveUnlockedBlock(blockId);
                toast.success('Content unlocked!');
              }}
            />
          )}

          {/* Contact Form Modal */}
          {showContactModal && selectedBlock && page && (
            <ContactFormModal
              block={selectedBlock}
              pageId={page.id}
              onClose={() => {
                setShowContactModal(false);
                setSelectedBlock(null);
              }}
            />
          )}

          {/* AMA Modal */}
          {showAMAModal && selectedBlock && page && (
            <AMAModal
              block={selectedBlock}
              pageId={page.id}
              ownerId={page.user?.id || page.userId}
              onClose={() => {
                setShowAMAModal(false);
                setSelectedBlock(null);
              }}
            />
          )}

          {/* Magical QR Code Share - Auto-generated for every page */}
          {page && (
            <QRCodeShare
              pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
              pageTitle={page.title || page.metaTitle || resolvedDisplayName || 'My Page'}
              pageId={page.id}
            />
          )}
        </>
      )}
    </>
  );
};

export default memo(EnhancedPublicPage);