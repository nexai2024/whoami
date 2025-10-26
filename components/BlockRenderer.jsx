"use client";
import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiExternalLink, FiShoppingBag, FiMail, FiImage, FiMusic, FiVideo,
  FiCalendar, FiLink, FiDollarSign, FiShare2, FiStar, FiHeart
} = FiIcons;

/**
 * Comprehensive block renderer for all 23 block types
 * Renders blocks on the public page with proper styling and interactivity
 */
const BlockRenderer = ({ block, onBlockClick }) => {
  const baseStyles = "w-full p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white shadow-sm hover:shadow-md border border-gray-200";

  // LINK Block
  if (block.type === 'LINK') {
    return (
      <div className={baseStyles} onClick={() => onBlockClick(block)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {block.data?.thumbnail && (
              <img src={block.data.thumbnail} alt={block.title} className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{block.title}</h3>
                {block.data?.badge && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">{block.data.badge}</span>
                )}
              </div>
              {block.data?.description && (
                <p className="text-sm text-gray-600 mt-1">{block.data.description}</p>
              )}
            </div>
          </div>
          <SafeIcon name={undefined}  icon={FiExternalLink} className="text-gray-400" />
        </div>
      </div>
    );
  }

  // PRODUCT Block
  if (block.type === 'PRODUCT') {
    return (
      <div className={`${baseStyles} bg-gradient-to-r from-green-50 to-emerald-50 border-green-200`} onClick={() => onBlockClick(block)}>
        <div className="flex gap-4">
          {block.data?.images?.[0] && (
            <img src={block.data.images[0]} alt={block.title} className="w-20 h-20 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{block.title}</h3>
            {block.data?.description && (
              <p className="text-sm text-gray-600 mb-2">{block.data.description}</p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                {block.data?.currency || '$'}{block.data?.price || '0'}
              </span>
              {block.data?.originalPrice && block.data.originalPrice > block.data.price && (
                <span className="text-sm text-gray-400 line-through">
                  {block.data.currency || '$'}{block.data.originalPrice}
                </span>
              )}
              {block.data?.averageRating && (
                <div className="flex items-center gap-1 ml-auto">
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
      <div className={`${baseStyles} bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200`} onClick={() => onBlockClick(block)}>
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
    return (
      <div className={baseStyles}>
        <h3 className="font-bold text-gray-900 mb-3">{block.title}</h3>
        <div className={`grid ${block.data?.layout === 'grid' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {images.slice(0, block.data?.maxImages || 6).map((img, idx) => (
            <img
              key={idx}
              src={typeof img === 'string' ? img : img.url}
              alt={typeof img === 'object' ? img.altText || '' : ''}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // MUSIC_PLAYER Block
  if (block.type === 'MUSIC_PLAYER') {
    return (
      <div className={`${baseStyles} bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200`}>
        <div className="flex gap-4 items-center">
          {block.data?.albumArtwork && (
            <img src={block.data.albumArtwork} alt={block.data?.trackTitle} className="w-16 h-16 rounded-lg" />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{block.data?.trackTitle || block.title}</h3>
            {block.data?.artistName && (
              <p className="text-sm text-gray-600">{block.data.artistName}</p>
            )}
            {block.data?.duration && (
              <p className="text-xs text-gray-500 mt-1">{block.data.duration}</p>
            )}
          </div>
          <SafeIcon name={undefined}  icon={FiMusic} className="text-orange-500 text-2xl" />
        </div>
      </div>
    );
  }

  // VIDEO_EMBED Block
  if (block.type === 'VIDEO_EMBED') {
    return (
      <div className={baseStyles}>
        <h3 className="font-bold text-gray-900 mb-3">{block.title}</h3>
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {block.data?.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <SafeIcon name={undefined}  icon={FiVideo} className="text-white text-4xl" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // BOOKING_CALENDAR Block
  if (block.type === 'BOOKING_CALENDAR') {
    return (
      <div className={`${baseStyles} bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200`} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined}  icon={FiCalendar} className="text-3xl text-indigo-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">{block.title}</h3>
          {block.data?.serviceType && (
            <p className="text-sm text-gray-600 mb-1">{block.data.serviceType}</p>
          )}
          {block.data?.duration && (
            <p className="text-sm text-gray-500 mb-3">{block.data.duration} minutes</p>
          )}
          {block.data?.price && (
            <p className="text-lg font-bold text-indigo-600 mb-3">${block.data.price}</p>
          )}
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm font-medium text-indigo-600">{block.data?.bookingButtonText || 'Book Now'}</p>
          </div>
        </div>
      </div>
    );
  }

  // TIP_JAR Block
  if (block.type === 'TIP_JAR') {
    return (
      <div className={`${baseStyles} bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200`} onClick={() => onBlockClick(block)}>
        <div className="text-center">
          <SafeIcon name={undefined}  icon={FiHeart} className="text-3xl text-yellow-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">{block.title}</h3>
          {block.data?.message && (
            <p className="text-sm text-gray-600 mb-4">{block.data.message}</p>
          )}
          {block.data?.suggestedAmounts && block.data.suggestedAmounts.length > 0 && (
            <div className="flex gap-2 justify-center mb-3">
              {block.data.suggestedAmounts.map((amount, idx) => (
                <div key={idx} className="px-4 py-2 bg-white rounded-lg border border-yellow-200">
                  <span className="font-medium text-gray-900">{block.data?.currency || '$'}{amount}</span>
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
      <div className={`${baseStyles} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300`}>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 mb-2">{block.title}</h3>
          {block.data?.description && (
            <p className="text-sm text-gray-600 mb-3">{block.data.description}</p>
          )}
          <div className="bg-white border-2 border-dashed border-yellow-400 rounded-lg p-4 mb-2">
            <p className="text-2xl font-mono font-bold text-gray-900">{block.data?.promoCode}</p>
          </div>
          {(block.data?.discountPercentage || block.data?.discountAmount) && (
            <p className="text-sm font-medium text-yellow-700">
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
      <div className={`${baseStyles} bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200`}>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 mb-3">{block.title}</h3>
          <div className="flex gap-3 justify-center">
            <button className="p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <SafeIcon name={undefined}  icon={FiShare2} className="text-cyan-600" />
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
    }[block.data?.textAlign || 'left'];

    const sizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xl: 'text-xl'
    }[block.data?.fontSize || 'medium'];

    return (
      <div
        className={`${baseStyles} ${alignmentClass}`}
        style={{
          backgroundColor: block.data?.backgroundColor || 'white',
          color: block.data?.textColor || '#1f2937',
          padding: `${block.data?.padding || 24}px`
        }}
      >
        <div className={sizeClass}>
          {block.data?.content || block.title}
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
      <div className={baseStyles} onClick={() => onBlockClick(block)}>
        {block.data?.images?.[0] && (
          <img src={block.data.images[0]} alt={block.data?.projectTitle} className="w-full h-48 object-cover rounded-lg mb-3" />
        )}
        <h3 className="font-bold text-gray-900 mb-2">{block.data?.projectTitle || block.title}</h3>
        {block.data?.projectDescription && (
          <p className="text-sm text-gray-600 mb-2">{block.data.projectDescription}</p>
        )}
        {block.data?.technologies && block.data.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {block.data.technologies.map((tech, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{tech}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // CONTACT_FORM Block
  if (block.type === 'CONTACT_FORM') {
    return (
      <div className={`${baseStyles} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200`} onClick={() => onBlockClick(block)}>
        <h3 className="font-bold text-gray-900 mb-2">{block.title}</h3>
        {block.description && (
          <p className="text-sm text-gray-600 mb-4">{block.description}</p>
        )}
        <div className="space-y-3">
          {block.data?.fields && block.data.fields.slice(0, 3).map((field, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-500">{field.placeholder || field.name}</p>
            </div>
          ))}
          {block.data?.fields && block.data.fields.length > 3 && (
            <p className="text-xs text-gray-500 text-center">+ {block.data.fields.length - 3} more fields</p>
          )}
          <div className="bg-indigo-600 text-white rounded-lg p-3 text-center mt-4">
            <p className="text-sm font-medium">{block.data?.submitButtonText || 'Submit'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default rendering for other block types
  return (
    <div className={baseStyles} onClick={() => onBlockClick(block)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{block.title}</h3>
          {block.description && (
            <p className="text-sm text-gray-600 mt-1">{block.description}</p>
          )}
        </div>
        <SafeIcon name={undefined}  icon={FiExternalLink} className="text-gray-400" />
      </div>
    </div>
  );
};

export default BlockRenderer;
