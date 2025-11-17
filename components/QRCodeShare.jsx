"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { logger } from '../lib/utils/logger';

const {
  FiX, FiDownload, FiCopy, FiShare2, FiQrCode, FiLink, FiSmartphone,
  FiTwitter, FiFacebook, FiLinkedin, FiMail, FiCheck
} = FiIcons;

/**
 * Magical QR Code Share Component
 * Auto-generated QR code for every page with beautiful animations and sharing options
 */
const QRCodeShare = ({ pageUrl, pageTitle, pageId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef(null);

  // Track QR code view and detect if user came from QR code
  useEffect(() => {
    if (isOpen && pageId) {
      // Track QR code modal open as analytics event
      try {
        fetch('/api/analytics/clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId,
            blockId: null, // QR code is not a block
            utmSource: 'qr_code',
            utmMedium: 'qr',
            utmCampaign: 'share',
            eventType: 'qr_code_viewed'
          })
        }).catch(() => {
          // Silently fail - analytics shouldn't break functionality
        });
      } catch (err) {
        logger.error('Error tracking QR view:', err);
      }
    }

    // Check if user arrived via QR code scan (on page load)
    if (typeof window !== 'undefined' && pageId) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('utm_source') === 'qr_code') {
        // Track the scan
        fetch('/api/qr-code/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId,
            source: urlParams.get('utm_content') || 'direct_scan',
            userAgent: navigator.userAgent,
            ipAddress: 'unknown' // Will be determined server-side if needed
          })
        }).catch(() => {
          // Silently fail
        });
      }
    }
  }, [isOpen, pageId]);

  // Generate QR code with UTM parameters for tracking
  const qrUrl = `${pageUrl}${pageUrl.includes('?') ? '&' : '?'}utm_source=qr_code&utm_medium=qr&utm_campaign=share`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!', {
        icon: '🔗',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Error copying to clipboard:', err);
      toast.error('Failed to copy link');
    }
  };

  const downloadQR = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        toast.error('QR code not ready');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = qrSize + 80; // Add padding
        canvas.height = qrSize + 120; // Add padding and text space
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(img, 40, 40, qrSize, qrSize);

        // Add text below QR code
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pageTitle || 'My Page', canvas.width / 2, qrSize + 70);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pageTitle?.replace(/[^a-z0-9]/gi, '_') || 'page'}_qr_code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('QR code downloaded!', {
              icon: '📥',
            });
          }
        }, 'image/png');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      logger.error('Error downloading QR code:', err);
      toast.error('Failed to download QR code');
    }
  };

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(pageTitle || 'Check this out!');
    const encodedText = encodeURIComponent(`${pageTitle || 'Check this out!'} - ${pageUrl}`);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button - Magical Entrance */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 1 
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-indigo-500/50 transition-all duration-300 group"
        aria-label="Share page with QR code"
      >
        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-75"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.75, 0, 0.75],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <SafeIcon 
          name={undefined} 
          icon={FiQrCode} 
          className="relative z-10 text-2xl group-hover:scale-110 transition-transform" 
        />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)',
                      backgroundSize: '200% 200%'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <SafeIcon name={undefined} icon={FiQrCode} className="text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Share This Page</h2>
                          <p className="text-sm text-white/80">Scan or share instantly</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors"
                        aria-label="Close"
                      >
                        <SafeIcon name={undefined} icon={FiX} className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code Content */}
                <div className="p-8">
                  {/* QR Code Display */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 flex flex-col items-center"
                    ref={qrRef}
                  >
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <QRCodeSVG
                        value={qrUrl}
                        size={qrSize}
                        level="H"
                        includeMargin={true}
                        fgColor="#1f2937"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="mt-4 text-sm text-gray-600 text-center font-medium">
                      {pageTitle || 'My Page'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 text-center max-w-xs truncate">
                      {pageUrl}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Copy Link Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={copyToClipboard}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl border-2 border-indigo-200 transition-all group"
                    >
                      {copied ? (
                        <>
                          <SafeIcon name={undefined} icon={FiCheck} className="text-green-600 text-xl" />
                          <span className="font-semibold text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <SafeIcon name={undefined} icon={FiCopy} className="text-indigo-600 text-xl group-hover:scale-110 transition-transform" />
                          <span className="font-semibold text-indigo-600">Copy Link</span>
                        </>
                      )}
                    </motion.button>

                    {/* Download QR Code */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadQR}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-purple-200 transition-all group"
                    >
                      <SafeIcon name={undefined} icon={FiDownload} className="text-purple-600 text-xl group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-purple-600">Download QR Code</span>
                    </motion.button>

                    {/* Social Share Buttons */}
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 text-center mb-3">Share on social media</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { icon: FiTwitter, label: 'Twitter', color: 'from-blue-400 to-blue-600', platform: 'twitter' },
                          { icon: FiFacebook, label: 'Facebook', color: 'from-blue-500 to-blue-700', platform: 'facebook' },
                          { icon: FiLinkedin, label: 'LinkedIn', color: 'from-blue-600 to-blue-800', platform: 'linkedin' },
                          { icon: FiMail, label: 'Email', color: 'from-gray-400 to-gray-600', platform: 'email' },
                        ].map(({ icon, label, color, platform }) => (
                          <motion.button
                            key={platform}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => shareToSocial(platform)}
                            className={`flex flex-col items-center gap-1 p-3 bg-gradient-to-br ${color} rounded-xl text-white shadow-md hover:shadow-lg transition-all`}
                            aria-label={`Share on ${label}`}
                          >
                            <SafeIcon name={undefined} icon={icon} className="text-lg" />
                            <span className="text-xs font-medium">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Scanner Hint */}
                    {typeof window !== 'undefined' && /mobile|iphone|ipad|android/i.test(navigator.userAgent) && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                        <SafeIcon name={undefined} icon={FiSmartphone} className="text-blue-600" />
                        <p className="text-xs text-blue-800">
                          <strong>Tip:</strong> Open your camera app to scan this QR code
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default QRCodeShare;

