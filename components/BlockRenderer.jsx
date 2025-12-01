"use client";
import React from 'react';
import Image from 'next/image';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { logger } from '../lib/utils/logger';
import DOMPurify from 'isomorphic-dompurify';
import { applyBlockStyle } from '../lib/themes/blockStyles';

const {
  FiExternalLink, FiShoppingBag, FiMail, FiImage, FiMusic, FiVideo,
  FiCalendar, FiLink, FiDollarSign, FiShare2, FiStar, FiHeart, FiSettings
} = FiIcons;

/**
 * Comprehensive block renderer for all 23 block types
 * Renders blocks on the public page with proper styling and interactivity
 */
const BlockRenderer = ({ block, onBlockClick, themeColors }) => {
  // Error boundary - catch any rendering errors
  try {
    if (!block || !block.type) {
      logger.error('BlockRenderer: Invalid block data', block);
      return (
        <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Block data is invalid or missing</p>
        </div>
      );
    }

    // Get block style from block.style JSON or use defaults
    const blockStyle = block.style || {
      shadow: 'md',
      borderRadius: 'lg',
      hoverEffect: 'lift',
      border: {
        width: 1,
        style: 'solid',
        color: themeColors?.border || '#E5E7EB',
      },
      backgroundColor: themeColors?.surface || '#FFFFFF',
      textColor: themeColors?.text || '#111827',
    };

    // Apply enhanced styling
    const styleProps = applyBlockStyle(blockStyle, themeColors?.primary);
    
    // Base classes with enhanced styling
    const baseClasses = `w-full p-6 cursor-pointer ${styleProps.className}`;
    const baseStyles = {
      ...styleProps.style,
      backgroundColor: blockStyle.backgroundColor || themeColors?.surface || '#FFFFFF',
      color: blockStyle.textColor || themeColors?.text || '#111827',
    };
  // LINK Block
  if (block.type === 'LINK') {
    const url = block.data?.url || block.url;
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="flex flex-col items-center gap-3">
          {block.data?.thumbnail && (
            <Image 
              src={block.data.thumbnail} 
              alt={block.title || 'Link'} 
              width={48} 
              height={48} 
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                logger.error('Image load error:', block.data.thumbnail);
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{block.title}</h3>
              {block.data?.badge && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">{block.data.badge}</span>
              )}
            </div>
            {block.data?.description && (
              <p className="text-sm text-gray-600">{block.data.description}</p>
            )}
          </div>
          <SafeIcon name={undefined} icon={FiExternalLink} className="text-gray-400" />
        </div>
      </div>
    );
  }

  // DEEP_LINK Block (normalize to handle both 'DEEP_LINK' and 'deep_link')
  const normalizedBlockType = block.type?.toUpperCase();
  if (normalizedBlockType === 'DEEP_LINK') {
    const showAppIcon = block.data?.showAppIcon !== false;

    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="flex flex-col items-center gap-3">
          {block.data?.thumbnail && (
            <Image 
              src={block.data.thumbnail} 
              alt={block.title || 'Deep Link'} 
              width={64} 
              height={64} 
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                logger.error('Deep link image load error:', block.data.thumbnail);
                e.target.style.display = 'none';
              }}
            />
          )}
          {showAppIcon && !block.data?.thumbnail && (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <SafeIcon name={undefined} icon={FiExternalLink} className="text-white text-2xl" />
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{block.title}</h3>
              {block.data?.badge && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{block.data.badge}</span>
              )}
            </div>
            {block.data?.description && (
              <p className="text-sm text-gray-600">{block.data.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <SafeIcon name={undefined} icon={FiExternalLink} className="text-gray-400" />
              <span>Opens in app or browser</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRODUCT Block
  if (block.type === 'PRODUCT') {
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="flex flex-col items-center gap-4">
          {block.data?.images?.[0] && (
            <Image 
              src={block.data.images[0]} 
              alt={block.title || 'Product'} 
              width={80} 
              height={80} 
              className="w-20 h-20 rounded-lg object-cover"
              onError={(e) => {
                logger.error('Product image load error:', block.data.images[0]);
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-1">{block.title}</h3>
            {block.data?.description && (
              <p className="text-sm text-gray-600 mb-2">{block.data.description}</p>
            )}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {block.data?.currency || '$'}{block.data?.price || '0'}
                </span>
                {block.data?.originalPrice && block.data.originalPrice > block.data.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {block.data.currency || '$'}{block.data.originalPrice}
                  </span>
                )}
              </div>
              {block.data?.averageRating && (
                <div className="flex items-center gap-1">
                  <SafeIcon name={undefined}  icon={FiStar} className="text-yellow-500 text-sm" />
                  <span className="text-sm font-medium">{block.data.averageRating}</span>
                  {block.data?.reviewCount && (
                    <span className="text-sm text-gray-500">({block.data.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
            {block.data?.stockStatus && block.data.stockStatus !== 'in_stock' && (
              <p className="text-sm text-red-600 mt-2">
                {block.data.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'On Backorder'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EMAIL_CAPTURE / NEWSLETTER / WAITLIST Blocks
  if (['EMAIL_CAPTURE', 'NEWSLETTER', 'WAITLIST'].includes(block.type)) {
    return (
      <div className={`${baseClasses}`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined}  icon={FiMail} className="text-3xl text-purple-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">{block.title}</h3>
          {block.data?.description && (
            <p className="text-sm text-gray-600 mb-4">{block.data.description}</p>
          )}
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-purple-600">{block.data?.buttonText || 'Subscribe'}</p>
          </div>
        </div>
      </div>
    );
  }

  // IMAGE_GALLERY Block
  if (block.type === 'IMAGE_GALLERY') {
    const images = block.data?.images || [];
    const layout = block.data?.layout || 'grid';
    const maxImages = block.data?.maxImages || 6;
    const clickBehavior = block.data?.clickBehavior || 'lightbox';
    
    const handleImageClick = (img, idx) => {
      if (clickBehavior === 'lightbox') {
        // Simple lightbox - could be enhanced with a proper modal
        window.open(typeof img === 'string' ? img : img.url, '_blank');
      } else if (clickBehavior === 'link' && typeof img === 'object' && img.link) {
        window.open(img.link, '_blank', 'noopener,noreferrer');
      }
      onBlockClick(block);
    };
    
    const gridCols = {
      grid: 'grid-cols-3',
      masonry: 'grid-cols-2',
      carousel: 'grid-cols-1',
      slider: 'grid-cols-1'
    }[layout] || 'grid-cols-3';
    
    return (
      <div className={`${baseStyles} text-center`}>
        <h3 className="font-bold text-gray-900 mb-3">{block.title}</h3>
        <div className={`grid ${gridCols} gap-2`}>
          {images.slice(0, maxImages).map((img, idx) => {
            const imgUrl = typeof img === 'string' ? img : img.url;
            const imgAlt = typeof img === 'object' ? img.altText || block.title : block.title;
            return (
              <div
                key={idx}
                onClick={() => handleImageClick(img, idx)}
                className={clickBehavior !== 'none' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              >
                <Image
                  src={imgUrl}
                  alt={imgAlt}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
            );
          })}
        </div>
        {block.data?.showLoadMore && images.length > maxImages && (
          <button
            onClick={() => onBlockClick(block)}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Load More ({images.length - maxImages} more)
          </button>
        )}
      </div>
    );
  }

  // MUSIC_PLAYER Block
  if (block.type === 'MUSIC_PLAYER') {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const audioRef = React.useRef(null);

    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }, []);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
      const audio = audioRef.current;
      if (!audio) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audio.currentTime = percentage * duration;
    };

    return (
      <div className={`${baseClasses} text-center`} style={baseStyles}>
        <div className="flex flex-col items-center gap-4">
          {block.data?.albumArtwork && (
            <Image src={block.data.albumArtwork} alt={block.data?.trackTitle || 'Album artwork'} width={128} height={128} className="w-32 h-32 rounded-lg object-cover" />
          )}
          <div className="flex flex-col items-center w-full">
            <h3 className="font-bold text-gray-900">{block.data?.trackTitle || block.title}</h3>
            {block.data?.artistName && (
              <p className="text-sm text-gray-600">{block.data.artistName}</p>
            )}
            
            {block.data?.audioUrl && (
              <>
                <audio ref={audioRef} src={block.data.audioUrl} preload="metadata" />
                
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 bg-gray-200 rounded-full mt-4 cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-3 w-full">
                  <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                </div>

                {/* Links */}
                <div className="flex gap-3 mt-3">
                  {block.data?.spotifyUrl && (
                    <a href={block.data.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-orange-600">
                      Spotify
                    </a>
                  )}
                  {block.data?.appleMusicUrl && (
                    <a href={block.data.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-orange-600">
                      Apple Music
                    </a>
                  )}
                  {block.data?.downloadUrl && (
                    <a href={block.data.downloadUrl} download className="text-xs text-gray-600 hover:text-orange-600">
                      Download
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VIDEO_EMBED Block
  if (block.type === 'VIDEO_EMBED') {
    const videoUrl = block.data?.videoUrl || '';
    const platform = block.data?.platform || 'youtube';
    
    // Extract video ID from common platforms
    const getEmbedUrl = (url, platform) => {
      if (!url) return null;
      
      if (platform === 'youtube') {
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      } else if (platform === 'vimeo') {
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const match = url.match(vimeoRegex);
        if (match) {
          return `https://player.vimeo.com/video/${match[1]}`;
        }
      }
      
      return url; // Return as-is for custom embeds
    };
    
    const embedUrl = getEmbedUrl(videoUrl, platform);
    
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles}>
        <h3 className="font-bold mb-3" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={block.title || 'Video'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <SafeIcon name={undefined} icon={FiVideo} className="text-white text-4xl" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // BOOKING_CALENDAR Block
  if (block.type === 'BOOKING_CALENDAR') {
    return (
      <div className={`${baseClasses}`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined}  icon={FiCalendar} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.primary || '#6366F1' }} />
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          {block.data?.serviceType && (
            <p className="text-sm mb-1" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.serviceType}</p>
          )}
          {block.data?.duration && (
            <p className="text-sm mb-3" style={{ color: themeColors?.textSecondary || '#9CA3AF' }}>{block.data.duration} minutes</p>
          )}
          {block.data?.price && (
            <p className="text-lg font-bold mb-3" style={{ color: themeColors?.primary || '#6366F1' }}>${block.data.price}</p>
          )}
          <div className="rounded-lg p-3" style={{ backgroundColor: themeColors?.background || '#FFFFFF' }}>
            <p className="text-sm font-medium" style={{ color: themeColors?.primary || '#6366F1' }}>{block.data?.bookingButtonText || 'Book Now'}</p>
          </div>
        </div>
      </div>
    );
  }

  // TIP_JAR Block
  if (block.type === 'TIP_JAR') {
    return (
      <div className={`${baseClasses}`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined}  icon={FiHeart} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.accent || '#F59E0B' }} />
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          {block.data?.message && (
            <p className="text-sm mb-4" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.message}</p>
          )}
          {block.data?.suggestedAmounts && block.data.suggestedAmounts.length > 0 && (
            <div className="flex gap-2 justify-center mb-3">
              {block.data.suggestedAmounts.map((amount, idx) => (
                <div key={idx} className="px-4 py-2 rounded-lg border" style={{ backgroundColor: themeColors?.background || '#FFFFFF', borderColor: themeColors?.border || '#E5E7EB' }}>
                  <span className="font-medium" style={{ color: themeColors?.text || '#111827' }}>{block.data?.currency || '$'}{amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROMO Block
  if (block.type === 'PROMO') {
    return (
      <div className={`${baseClasses}`} style={baseStyles}>
        <div className="text-center">
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          {block.data?.description && (
            <p className="text-sm mb-3" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.description}</p>
          )}
          <div className="border-2 border-dashed rounded-lg p-4 mb-2" style={{ backgroundColor: themeColors?.background || '#FFFFFF', borderColor: themeColors?.accent || '#F59E0B' }}>
            <p className="text-2xl font-mono font-bold" style={{ color: themeColors?.text || '#111827' }}>{block.data?.promoCode}</p>
          </div>
          {(block.data?.discountPercentage || block.data?.discountAmount) && (
            <p className="text-sm font-medium" style={{ color: themeColors?.accent || '#F59E0B' }}>
              {block.data.discountPercentage ? `${block.data.discountPercentage}% OFF` : `$${block.data.discountAmount} OFF`}
            </p>
          )}
        </div>
      </div>
    );
  }

  // SOCIAL_SHARE Block
  if (block.type === 'SOCIAL_SHARE') {
    return (
      <div className={`${baseClasses}`} style={baseStyles}>
        <div className="text-center">
          <h3 className="font-bold mb-3" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          <div className="flex gap-3 justify-center">
            <button className="p-3 rounded-lg hover:opacity-80 transition-colors" style={{ backgroundColor: themeColors?.background || '#FFFFFF' }}>
              <SafeIcon name={undefined}  icon={FiShare2} style={{ color: themeColors?.primary || '#06B6D4' }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TEXT_BLOCK
  if (block.type === 'TEXT_BLOCK') {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    }[block.data?.textAlign || 'center'];

    const sizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xl: 'text-xl'
    }[block.data?.fontSize || 'medium'];

    // Sanitize HTML content for TEXT_BLOCK
    const content = block.data?.content || block.title || '';
    const sanitizedContent = typeof content === 'string' && content.includes('<') 
      ? DOMPurify.sanitize(content, { 
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        })
      : content;

    return (
      <div
        className={`${baseClasses} ${alignmentClass}`}
        style={{
          ...baseStyles,
          backgroundColor: block.data?.backgroundColor || baseStyles.backgroundColor || 'white',
          color: block.data?.textColor || baseStyles.color || '#1f2937',
          padding: `${block.data?.padding || 24}px`
        }}
      >
        <div className={sizeClass}>
          {typeof sanitizedContent === 'string' && sanitizedContent.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          ) : (
            sanitizedContent
          )}
        </div>
      </div>
    );
  }

  // DIVIDER Block
  if (block.type === 'DIVIDER') {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          marginTop: `${block.data?.marginTop || 16}px`,
          marginBottom: `${block.data?.marginBottom || 16}px`
        }}
      >
        <div
          style={{
            width: `${block.data?.width || 100}%`,
            height: `${block.data?.thickness || 1}px`,
            backgroundColor: block.data?.color || '#E5E7EB',
            borderStyle: block.data?.style || 'solid'
          }}
        />
      </div>
    );
  }

  // PORTFOLIO Block
  if (block.type === 'PORTFOLIO') {
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        {block.data?.images?.[0] && (
          <Image src={block.data.images[0]} alt={block.data?.projectTitle || 'Project image'} width={400} height={192} className="w-full h-48 object-cover rounded-lg mb-3" />
        )}
        <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.data?.projectTitle || block.title}</h3>
        {block.data?.projectDescription && (
          <p className="text-sm mb-2" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.projectDescription}</p>
        )}
        {block.data?.technologies && block.data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {block.data.technologies.map((tech, idx) => (
              <span key={idx} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: themeColors?.surface || '#F3F4F6', color: themeColors?.text || '#374151' }}>{tech}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // CONTACT_FORM Block
  if (block.type === 'CONTACT_FORM') {
    const fields = block.data?.fields || [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'message', label: 'Message', type: 'textarea' }
    ];
    
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title || 'Contact Us'}</h3>
        {block.description && (
          <p className="text-sm mb-4" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.description}</p>
        )}
        <div className="space-y-3">
          {fields.slice(0, 3).map((field, idx) => (
            <div key={idx} className="rounded-lg p-3 border" style={{ backgroundColor: themeColors?.background || '#FFFFFF', borderColor: themeColors?.border || '#E5E7EB' }}>
              <p className="text-sm" style={{ color: themeColors?.textSecondary || '#9CA3AF' }}>{field.placeholder || field.label || field.name}</p>
            </div>
          ))}
          {fields.length > 3 && (
            <p className="text-xs text-center" style={{ color: themeColors?.textSecondary || '#9CA3AF' }}>+ {fields.length - 3} more fields</p>
          )}
          <div className="rounded-lg p-3 text-center mt-4 cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: themeColors?.primary || '#4F46E5', color: themeColors?.background || '#FFFFFF' }}>
            <p className="text-sm font-medium">{block.data?.submitButtonText || 'Send Message'}</p>
          </div>
        </div>
      </div>
    );
  }

  // COURSE Block
  if (block.type === 'COURSE') {
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="flex flex-col items-center gap-4">
          {block.data?.coverImageUrl && (
            <Image src={block.data.coverImageUrl} alt={block.title} width={200} height={120} className="w-full h-32 object-cover rounded-lg" />
          )}
          <div className="flex flex-col items-center">
            <h3 className="font-bold mb-1" style={{ color: themeColors?.text || '#111827' }}>{block.data?.headline || block.title}</h3>
            {block.data?.subheadline && (
              <p className="text-sm mb-2" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.subheadline}</p>
            )}
            {block.data?.description && (
              <p className="text-sm mb-3 line-clamp-2" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.description}</p>
            )}
            {block.data?.features && block.data.features.length > 0 && (
              <ul className="text-xs mb-3 space-y-1" style={{ color: themeColors?.textSecondary || '#6B7280' }}>
                {block.data.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            )}
            <div className="rounded-lg px-6 py-2 mt-2" style={{ backgroundColor: themeColors?.primary || '#2563EB', color: themeColors?.background || '#FFFFFF' }}>
              <p className="text-sm font-medium">{block.data?.buttonText || 'Enroll Now'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DISCOUNT Block
  if (block.type === 'DISCOUNT') {
    return (
      <div className={`${baseClasses}`} style={baseStyles}>
        <div className="text-center">
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          {block.data?.description && (
            <p className="text-sm mb-3" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.data.description}</p>
          )}
          <div className="border-2 border-dashed rounded-lg p-4 mb-2" style={{ backgroundColor: themeColors?.background || '#FFFFFF', borderColor: themeColors?.accent || '#EF4444' }}>
            {(block.data?.discountPercentage || block.data?.discountAmount) && (
              <p className="text-3xl font-bold mb-1" style={{ color: themeColors?.accent || '#EF4444' }}>
                {block.data.discountPercentage ? `${block.data.discountPercentage}% OFF` : `$${block.data.discountAmount} OFF`}
              </p>
            )}
            {block.data?.code && (
              <p className="text-lg font-mono font-semibold" style={{ color: themeColors?.text || '#111827' }}>{block.data.code}</p>
            )}
          </div>
          {block.data?.showCountdown && (
            <p className="text-xs" style={{ color: themeColors?.textSecondary || '#9CA3AF' }}>Limited time offer</p>
          )}
        </div>
      </div>
    );
  }

  // SOCIAL_FEED Block
  if (block.type === 'SOCIAL_FEED') {
    const [feedItems, setFeedItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const loadFeed = async () => {
        if (!block.data?.platform || !block.data?.username) return;

        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/social-feed?platform=${encodeURIComponent(block.data.platform)}&username=${encodeURIComponent(block.data.username)}&itemCount=${block.data?.itemCount || 10}`
          );
          const data = await response.json();

          if (data.success) {
            setFeedItems(data.items || []);
          } else {
            setError(data.error || 'Failed to load feed');
          }
        } catch (err) {
          setError('Failed to load social feed');
          logger.error('Social feed error:', err);
        } finally {
          setLoading(false);
        }
      };

      loadFeed();

      // Refresh feed periodically if refreshInterval is set
      let interval;
      if (block.data?.refreshInterval) {
        interval = setInterval(loadFeed, block.data.refreshInterval * 60 * 1000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [block.data?.platform, block.data?.username, block.data?.itemCount, block.data?.refreshInterval]);

    const layout = block.data?.layout || 'grid';
    const feedType = block.data?.feedType || 'posts';

    return (
      <div className={`${baseClasses}`} style={baseStyles}>
        <div className="text-center">
          <SafeIcon name={undefined} icon={FiShare2} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.primary || '#EC4899' }} />
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          {block.data?.username && (
            <p className="text-sm text-gray-600 mb-1">@{block.data.username}</p>
          )}
          {block.data?.platform && (
            <p className="text-xs text-gray-500 mb-3 capitalize">{block.data.platform} {feedType}</p>
          )}

          {loading && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">Loading feed...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && feedItems.length === 0 && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">No posts found</p>
            </div>
          )}

          {!loading && !error && feedItems.length > 0 && (
            <div className={`${layout === 'grid' ? 'grid grid-cols-3 gap-2' : layout === 'carousel' ? 'flex gap-2 overflow-x-auto' : 'space-y-2'}`}>
              {feedItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-lg p-2 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (item.url) {
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  {item.image && (
                    <Image src={item.image} alt={item.text || 'Post'} width={100} height={100} className="w-full h-24 object-cover rounded mb-1" />
                  )}
                  {item.text && (
                    <p className="text-xs text-gray-700 line-clamp-2 mb-1">{item.text}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {item.likes !== undefined && <span>❤️ {item.likes}</span>}
                    {item.comments !== undefined && <span>💬 {item.comments}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AMA_BLOCK
  if (block.type === 'AMA_BLOCK') {
    return (
      <div className={`${baseClasses}`} style={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined} icon={FiMail} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.primary || '#9333EA' }} />
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.data?.questionFormTitle || block.title || 'Ask Me Anything'}</h3>
          {block.data?.introMessage && (
            <div 
              className="text-sm text-gray-600 mb-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: block.data.introMessage }}
            />
          )}
          <div className="bg-white rounded-lg p-4">
            <input
              type="text"
              placeholder={block.data?.questionPlaceholder || 'Your question...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              readOnly
            />
            <button className="w-full mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Submit Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RSS_FEED Block
  if (block.type === 'RSS_FEED') {
    const [feedItems, setFeedItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const loadFeed = async () => {
        if (!block.data?.feedUrl) return;

        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/rss-feed?url=${encodeURIComponent(block.data.feedUrl)}&itemCount=${block.data?.itemCount || 10}`);
          const data = await response.json();

          if (data.success) {
            setFeedItems(data.items || []);
          } else {
            setError(data.error || 'Failed to load feed');
          }
        } catch (err) {
          setError('Failed to load RSS feed');
          logger.error('RSS feed error:', err);
        } finally {
          setLoading(false);
        }
      };

      loadFeed();

      // Refresh feed periodically if refreshInterval is set
      let interval;
      if (block.data?.refreshInterval) {
        interval = setInterval(loadFeed, block.data.refreshInterval * 60 * 1000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [block.data?.feedUrl, block.data?.itemCount, block.data?.refreshInterval]);

    const layout = block.data?.layout || 'list';
    const showImages = block.data?.showImages !== false;
    const showDates = block.data?.showDates !== false;
    const showExcerpts = block.data?.showExcerpts !== false;
    const excerptLength = block.data?.excerptLength || 150;

    return (
      <div className={`${baseClasses}`} style={baseStyles}>
        <div className="text-center">
          <SafeIcon name={undefined} icon={FiLink} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.primary || '#F97316' }} />
          <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
          
          {loading && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">Loading feed...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && feedItems.length === 0 && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500">No items found in feed</p>
            </div>
          )}

          {!loading && !error && feedItems.length > 0 && (
            <div className={`${layout === 'grid' ? 'grid grid-cols-2 gap-3' : layout === 'cards' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}`}>
              {feedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (block.data?.linkBehavior === 'new_tab') {
                      window.open(item.link, '_blank', 'noopener,noreferrer');
                    } else if (block.data?.linkBehavior === 'same_tab') {
                      window.location.href = item.link;
                    } else {
                      onBlockClick(block);
                    }
                  }}
                >
                  {showImages && item.image && (
                    <Image src={item.image} alt={item.title} width={200} height={120} className="w-full h-24 object-cover rounded mb-2" />
                  )}
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{item.title}</h4>
                  {showExcerpts && item.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {item.description.substring(0, excerptLength)}
                      {item.description.length > excerptLength ? '...' : ''}
                    </p>
                  )}
                  {showDates && item.pubDate && (
                    <p className="text-xs text-gray-400">{new Date(item.pubDate).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ANALYTICS Block (should be invisible on public page)
  if (block.type === 'ANALYTICS') {
    return null; // Analytics blocks should not render on public pages
  }

  // CUSTOM Block
  if (block.type === 'CUSTOM') {
    const htmlContent = block.data?.htmlContent || '';
    const cssStyles = block.data?.cssStyles || '';
    const jsCode = block.data?.jsCode || '';
    const embedCode = block.data?.embedCode || '';
    const allowScripts = block.data?.allowScripts || false;
    
    // Sanitize HTML content (but allow scripts if explicitly enabled)
    const sanitizeOptions = allowScripts 
      ? { ALLOWED_TAGS: ['*'], ALLOWED_ATTR: ['*'] } // Allow everything if scripts enabled
      : {}; // Default sanitization (strips scripts)
    
    const sanitizedHtml = htmlContent ? DOMPurify.sanitize(htmlContent, sanitizeOptions) : '';
    const sanitizedEmbed = embedCode ? DOMPurify.sanitize(embedCode, sanitizeOptions) : '';
    const sanitizedCss = cssStyles ? DOMPurify.sanitize(cssStyles, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : '';
    
    return (
      <div className="w-full">
        {sanitizedCss && (
          <style dangerouslySetInnerHTML={{ __html: sanitizedCss }} />
        )}
        {sanitizedHtml && (
          <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        )}
        {sanitizedEmbed && (
          <div dangerouslySetInnerHTML={{ __html: sanitizedEmbed }} />
        )}
        {jsCode && allowScripts && (
          <script dangerouslySetInnerHTML={{ __html: jsCode }} />
        )}
      </div>
    );
  }

  // GATED_CONTENT Block
  if (block.type === 'GATED_CONTENT') {
    const isUnlocked = block.data?.isUnlocked || false;
    const accessRequirement = block.data?.accessRequirement || 'email';
    const previewContent = block.data?.previewContent || block.description || 'This content is locked. Click to unlock.';
    const unlockMethod = block.data?.unlockMethod || 'Click to unlock this content';
    const price = block.data?.price || 0;
    const currency = block.data?.currency || '$';
    
    return (
      <div className={`${baseClasses} text-center`} style={baseStyles}>
        {!isUnlocked ? (
          <>
            <div className="mb-4">
              <SafeIcon name={undefined} icon={FiSettings} className="text-3xl mx-auto mb-3" style={{ color: themeColors?.primary || '#D946EF' }} />
              <h3 className="font-bold mb-2" style={{ color: themeColors?.text || '#111827' }}>{block.title}</h3>
              {previewContent && (
                <div 
                  className="text-sm text-gray-600 mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              )}
            </div>
            <div className="bg-white rounded-lg p-4 mb-3">
              <p className="text-sm text-gray-700 mb-3">{unlockMethod}</p>
              {accessRequirement === 'payment' && price > 0 && (
                <p className="text-lg font-bold text-fuchsia-600 mb-2">
                  {currency}{price}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockClick(block);
                }}
                className="w-full bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
              >
                {accessRequirement === 'payment' && price > 0 
                  ? `Unlock for ${currency}${price}`
                  : accessRequirement === 'password'
                  ? 'Enter Password'
                  : accessRequirement === 'membership'
                  ? 'Check Membership'
                  : 'Unlock Content'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">{block.title}</h3>
            {block.data?.contentUrl ? (
              <div className="space-y-3">
                {block.data?.contentType === 'video' && (
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={block.data.contentUrl}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {block.data?.contentType === 'external_link' && (
                  <a
                    href={block.data.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
                  >
                    View Content <SafeIcon name={undefined} icon={FiExternalLink} className="inline ml-2" />
                  </a>
                )}
                {block.data?.contentType === 'file' && (
                  <a
                    href={block.data.contentUrl}
                    download
                    className="inline-block bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
                  >
                    Download File <SafeIcon name={undefined} icon={FiExternalLink} className="inline ml-2" />
                  </a>
                )}
                {block.data?.contentType === 'text' && (
                  <div 
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.contentUrl) }}
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Content unlocked! Content URL not configured.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default rendering for other block types
  return (
    <div className={`${baseClasses} text-center`} style={baseStyles} onClick={() => onBlockClick(block)}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center">
          <h3 className="font-semibold" style={{ color: themeColors?.text || '#111827' }}>{block.title || 'Block'}</h3>
          {block.description && (
            <p className="text-sm" style={{ color: themeColors?.textSecondary || '#6B7280' }}>{block.description}</p>
          )}
        </div>
        <SafeIcon name={undefined}  icon={FiExternalLink} style={{ color: themeColors?.textSecondary || '#9CA3AF' }} />
      </div>
    </div>
  );
  } catch (error) {
    // Catch any rendering errors and display a fallback
    logger.error('BlockRenderer error:', error, { blockType: block?.type, blockId: block?.id });
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800 font-medium">Error rendering block</p>
        <p className="text-xs text-red-600 mt-1">
          {block?.title ? `Block: ${block.title}` : 'Unknown block type'}
        </p>
      </div>
    );
  }
};

export default BlockRenderer;
