"use client";
import React from 'react';

/**
 * Comprehensive block-specific form fields for all 23 block types
 * Each section handles the specific properties for that block type
 */

const BlockFormFields = ({ selectedBlock, updateBlockData }) => {
  // Normalize block type to lowercase for consistent matching
  const blockType = selectedBlock.type?.toLowerCase() || '';
  
  // Helper to add item to array
  const addToArray = (field, value = '') => {
    const current = selectedBlock.data?.[field] || [];
    updateBlockData(field, [...current, value]);
  };

  // Helper to remove item from array
  const removeFromArray = (field, index) => {
    const current = selectedBlock.data?.[field] || [];
    updateBlockData(field, current.filter((_, i) => i !== index));
  };

  // Helper to update array item
  const updateArrayItem = (field, index, value) => {
    const current = selectedBlock.data?.[field] || [];
    const updated = [...current];
    updated[index] = value;
    updateBlockData(field, updated);
  };

  const renderTextField = (label, field, placeholder = '', type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={selectedBlock.data?.[field] || ''}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        onChange={(e) => updateBlockData(field, e.target.value)}
      />
    </div>
  );

  const renderTextArea = (label, field, placeholder = '', rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        value={selectedBlock.data?.[field] || ''}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        onChange={(e) => updateBlockData(field, e.target.value)}
      />
    </div>
  );

  const renderNumberField = (label, field, min, max, step = 1) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="number"
        value={selectedBlock.data?.[field] || ''}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        onChange={(e) => updateBlockData(field, parseFloat(e.target.value))}
      />
    </div>
  );

  const renderSelect = (label, field, options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={selectedBlock.data?.[field] || ''}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        onChange={(e) => updateBlockData(field, e.target.value)}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (label, field) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={selectedBlock.data?.[field] || false}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        onChange={(e) => updateBlockData(field, e.target.checked)}
      />
      <label className="ml-2 block text-sm text-gray-700">{label}</label>
    </div>
  );

  const renderStringArray = (label, field, placeholder = '') => {
    const items = selectedBlock.data?.[field] || [];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => updateArrayItem(field, index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFromArray(field, index)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addToArray(field, '')}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
          >
            + Add {label}
          </button>
        </div>
      </div>
    );
  };

  // PRODUCT Block
  if (selectedBlock.type === 'product') {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderNumberField('Price', 'price', 0)}
        {renderNumberField('Original Price', 'originalPrice', 0)}
        {renderTextField('Currency', 'currency', 'USD')}
        {renderTextArea('Description', 'description', 'Short product description')}
        {renderTextArea('Long Description', 'longDescription', 'Detailed product description', 5)}
        {renderStringArray('Product Images (URLs)', 'images', 'https://example.com/image.jpg')}
        {renderStringArray('Features', 'features', 'Key product feature')}
        {renderNumberField('Average Rating', 'averageRating', 0, 5, 0.1)}
        {renderNumberField('Review Count', 'reviewCount', 0)}
        {renderSelect('Stock Status', 'stockStatus', [
          { value: 'in_stock', label: 'In Stock' },
          { value: 'out_of_stock', label: 'Out of Stock' },
          { value: 'backorder', label: 'Backorder' }
        ])}
        {renderTextField('SKU', 'sku', 'Product SKU')}
        {renderTextField('Category', 'category', 'Product category')}
        {renderStringArray('Tags', 'tags', 'Product tag')}
        {renderTextArea('Shipping Info', 'shippingInfo', 'Shipping details')}
        {renderTextArea('Return Policy', 'returnPolicy', 'Return policy details')}
        {renderTextField('Button Text', 'buttonText', 'Buy Now')}
        {renderTextField('Product URL', 'productUrl', 'https://store.com/product', 'url')}
      </div>
    );
  }

  // LINK Block
  if (selectedBlock.type === 'link') {
    return (
      <div className="space-y-4">
        {renderTextField('URL', 'url', 'https://example.com', 'url')}
        {renderTextArea('Description', 'description', 'Link description')}
        {renderTextField('Thumbnail URL', 'thumbnail', 'https://example.com/thumb.jpg', 'url')}
        {renderTextField('Badge', 'badge', 'New')}
        {renderCheckbox('Open in new tab', 'openInNewTab')}
        {renderCheckbox('Track clicks', 'trackClicks')}
        {renderSelect('Button Style', 'buttonStyle', [
          { value: 'default', label: 'Default' },
          { value: 'primary', label: 'Primary' },
          { value: 'outline', label: 'Outline' }
        ])}
      </div>
    );
  }

  // EMAIL_CAPTURE / NEWSLETTER / WAITLIST Blocks
  if (['email', 'newsletter', 'waitlist'].includes(selectedBlock.type)) {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderTextArea('Description', 'description', 'Subscribe for updates')}
        {renderTextField('Placeholder Text', 'placeholderText', 'Enter your email')}
        {renderTextField('Button Text', 'buttonText', 'Subscribe')}
        {renderTextArea('Success Message', 'successMessage', 'Thank you for subscribing!')}
        {renderCheckbox('Collect name', 'fieldsToCollect.name')}
        {renderCheckbox('Collect phone', 'fieldsToCollect.phone')}
        {renderTextField('Privacy Policy URL', 'privacyPolicyUrl', 'https://example.com/privacy', 'url')}
        {renderTextArea('Consent Text', 'consentText', 'I agree to receive emails')}
        {renderCheckbox('Require consent', 'requireConsent')}
        {renderCheckbox('Send welcome email', 'sendWelcomeEmail')}
        {renderTextField('List ID', 'listId', 'mailchimp-list-id')}
        {renderSelect('Integration Provider', 'integrationProvider', [
          { value: 'mailchimp', label: 'Mailchimp' },
          { value: 'convertkit', label: 'ConvertKit' },
          { value: 'custom', label: 'Custom' }
        ])}
        {selectedBlock.type === 'waitlist' && (
          <>
            {renderCheckbox('Show waitlist position', 'waitlistPosition')}
            {renderCheckbox('Show total waitlist count', 'totalWaitlist')}
            {renderTextField('Estimated Wait Time', 'estimatedWaitTime', '2-3 days')}
          </>
        )}
      </div>
    );
  }

  // IMAGE_GALLERY Block
  if (selectedBlock.type === 'image') {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderStringArray('Image URLs', 'images', 'https://example.com/image.jpg')}
        {renderSelect('Layout', 'layout', [
          { value: 'grid', label: 'Grid' },
          { value: 'masonry', label: 'Masonry' },
          { value: 'carousel', label: 'Carousel' },
          { value: 'slider', label: 'Slider' }
        ])}
        {renderSelect('Click Behavior', 'clickBehavior', [
          { value: 'lightbox', label: 'Lightbox' },
          { value: 'link', label: 'Link' },
          { value: 'none', label: 'None' }
        ])}
        {renderTextField('Aspect Ratio', 'aspectRatio', '16:9')}
        {renderNumberField('Spacing (px)', 'spacing', 0, 100)}
        {renderNumberField('Max Images', 'maxImages', 1, 100)}
        {renderCheckbox('Show Load More', 'showLoadMore')}
      </div>
    );
  }

  // MUSIC_PLAYER Block
  if (selectedBlock.type === 'music') {
    return (
      <div className="space-y-4">
        {renderTextField('Track Title', 'trackTitle', 'Song name')}
        {renderTextField('Artist Name', 'artistName', 'Artist')}
        {renderTextField('Album Name', 'albumName', 'Album')}
        {renderTextField('Album Artwork URL', 'albumArtwork', 'https://example.com/artwork.jpg', 'url')}
        {renderTextField('Audio File URL', 'audioUrl', 'https://example.com/audio.mp3', 'url')}
        {renderTextField('Duration', 'duration', '3:45')}
        {renderTextField('Spotify URL', 'spotifyUrl', 'https://spotify.com/track/...', 'url')}
        {renderTextField('Apple Music URL', 'appleMusicUrl', 'https://music.apple.com/...', 'url')}
        {renderTextField('SoundCloud URL', 'soundcloudUrl', 'https://soundcloud.com/...', 'url')}
        {renderTextField('Download URL', 'downloadUrl', 'https://example.com/download', 'url')}
        {renderTextField('Purchase URL', 'purchaseUrl', 'https://store.com/buy', 'url')}
      </div>
    );
  }

  // VIDEO_EMBED Block
  if (selectedBlock.type === 'video') {
    return (
      <div className="space-y-4">
        {renderTextField('Video URL', 'videoUrl', 'https://youtube.com/watch?v=...', 'url')}
        {renderSelect('Platform', 'platform', [
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
          { value: 'custom', label: 'Custom' }
        ])}
        {renderTextField('Thumbnail URL', 'thumbnailUrl', 'https://example.com/thumb.jpg', 'url')}
        {renderCheckbox('Auto-play', 'autoplay')}
        {renderCheckbox('Muted', 'muted')}
        {renderCheckbox('Show Controls', 'showControls')}
        {renderNumberField('Start Time (seconds)', 'startTime', 0)}
        {renderNumberField('End Time (seconds)', 'endTime', 0)}
        {renderTextField('Aspect Ratio', 'aspectRatio', '16:9')}
      </div>
    );
  }

  // BOOKING_CALENDAR Block
  if (selectedBlock.type === 'booking') {
    return (
      <div className="space-y-4">
        {renderTextField('Service Type', 'serviceType', 'Consultation')}
        {renderNumberField('Duration (minutes)', 'duration', 15, 480, 15)}
        {renderNumberField('Price', 'price', 0)}
        {renderSelect('Calendar Integration', 'calendarIntegration', [
          { value: 'calendly', label: 'Calendly' },
          { value: 'cal.com', label: 'Cal.com' },
          { value: 'google', label: 'Google Calendar' },
          { value: 'custom', label: 'Custom' }
        ])}
        {renderTextField('Calendar URL', 'calendarUrl', 'https://calendly.com/username', 'url')}
        {renderTextField('Timezone', 'timezone', 'America/New_York')}
        {renderNumberField('Buffer Time (minutes)', 'bufferTime', 0, 120, 5)}
        {renderNumberField('Max Bookings Per Day', 'maxBookingsPerDay', 1, 50)}
        {renderTextField('Button Text', 'bookingButtonText', 'Book Now')}
        {renderTextArea('Confirmation Message', 'confirmationMessage', 'Booking confirmed!')}
        {renderTextArea('Cancellation Policy', 'cancellationPolicy', 'Cancellation policy details')}
      </div>
    );
  }

  // PROMO Block
  if (selectedBlock.type === 'promo') {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderTextField('Promo Code', 'promoCode', 'SAVE20')}
        {renderTextArea('Description', 'description', 'Promo description')}
        {renderNumberField('Discount Amount', 'discountAmount', 0)}
        {renderNumberField('Discount Percentage', 'discountPercentage', 0, 100)}
        {renderTextField('Valid From', 'validFrom', '2025-01-01', 'date')}
        {renderTextField('Valid To', 'validTo', '2025-12-31', 'date')}
        {renderTextArea('Terms & Conditions', 'terms', 'Terms and conditions')}
        {renderNumberField('Usage Limit', 'usageLimit', 0)}
        {renderNumberField('Minimum Purchase', 'minPurchase', 0)}
        {renderStringArray('Applicable Products', 'applicableProducts', 'Product ID or Category')}
        {renderCheckbox('Show Copy Button', 'showCopyButton')}
      </div>
    );
  }

  // DISCOUNT Block
  if (selectedBlock.type === 'discount') {
    return (
      <div className="space-y-4">
        {renderNumberField('Discount Percentage', 'discountPercentage', 0, 100)}
        {renderNumberField('Fixed Discount Amount', 'discountAmount', 0)}
        {renderTextArea('Description', 'description', 'Discount description')}
        {renderTextField('Code', 'code', 'SAVE10')}
        {renderCheckbox('Code Required', 'codeRequired')}
        {renderTextField('Valid From', 'validFrom', '2025-01-01', 'date')}
        {renderTextField('Valid To', 'validTo', '2025-12-31', 'date')}
        {renderCheckbox('Show Countdown', 'showCountdown')}
        {renderTextArea('Terms', 'terms', 'Terms and conditions')}
        {renderCheckbox('Auto Apply', 'autoApply')}
      </div>
    );
  }

  // ANALYTICS Block
  if (selectedBlock.type === 'analytics') {
    return (
      <div className="space-y-4">
        {renderSelect('Provider', 'provider', [
          { value: 'google', label: 'Google Analytics' },
          { value: 'plausible', label: 'Plausible' },
          { value: 'fathom', label: 'Fathom' },
          { value: 'custom', label: 'Custom' }
        ])}
        {renderTextField('Tracking ID', 'trackingId', 'UA-XXXXX-Y')}
        {renderStringArray('Events to Track', 'eventsToTrack', 'Event name')}
        {renderNumberField('Data Retention Days', 'dataRetentionDays', 1, 365)}
      </div>
    );
  }

  // TIP_JAR Block
  if (selectedBlock.type === 'tip') {
    return (
      <div className="space-y-4">
        {renderTextArea('Message', 'message', 'Support my work!')}
        {renderStringArray('Suggested Amounts', 'suggestedAmounts', '5')}
        {renderCheckbox('Allow Custom Amount', 'allowCustomAmount')}
        {renderTextField('Currency', 'currency', 'USD')}
        {renderSelect('Payment Provider', 'paymentProvider', [
          { value: 'stripe', label: 'Stripe' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'custom', label: 'Custom' }
        ])}
        {renderTextArea('Thank You Message', 'thankYouMessage', 'Thank you for your support!')}
        {renderCheckbox('Show Supporter Names', 'showSupporterNames')}
        {renderNumberField('Goal Amount', 'goalAmount', 0)}
        {renderNumberField('Current Amount', 'currentAmount', 0)}
        {renderCheckbox('Show Goal Progress', 'showGoalProgress')}
      </div>
    );
  }

  // SOCIAL_FEED Block
  if (selectedBlock.type === 'social_feed') {
    return (
      <div className="space-y-4">
        {renderSelect('Platform', 'platform', [
          { value: 'instagram', label: 'Instagram' },
          { value: 'twitter', label: 'Twitter' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'tiktok', label: 'TikTok' }
        ])}
        {renderTextField('Username', 'username', '@username')}
        {renderSelect('Feed Type', 'feedType', [
          { value: 'posts', label: 'Posts' },
          { value: 'stories', label: 'Stories' },
          { value: 'timeline', label: 'Timeline' }
        ])}
        {renderNumberField('Item Count', 'itemCount', 1, 50)}
        {renderSelect('Layout', 'layout', [
          { value: 'grid', label: 'Grid' },
          { value: 'carousel', label: 'Carousel' },
          { value: 'list', label: 'List' }
        ])}
        {renderNumberField('Refresh Interval (minutes)', 'refreshInterval', 5, 1440)}
        {renderTextField('API Token', 'apiToken', 'Your API token', 'password')}
      </div>
    );
  }

  // SOCIAL_SHARE Block
  if (selectedBlock.type === 'social_share') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
          <div className="space-y-2">
            {renderCheckbox('Facebook', 'platforms.facebook')}
            {renderCheckbox('Twitter', 'platforms.twitter')}
            {renderCheckbox('LinkedIn', 'platforms.linkedin')}
            {renderCheckbox('Pinterest', 'platforms.pinterest')}
            {renderCheckbox('WhatsApp', 'platforms.whatsapp')}
            {renderCheckbox('Email', 'platforms.email')}
          </div>
        </div>
        {renderTextField('Share Text', 'shareText', 'Check this out!')}
        {renderStringArray('Hashtags', 'hashtags', 'hashtag')}
        {renderTextField('Share URL', 'shareUrl', 'https://example.com', 'url')}
        {renderSelect('Button Style', 'buttonStyle', [
          { value: 'icons', label: 'Icons' },
          { value: 'buttons', label: 'Buttons' },
          { value: 'text', label: 'Text' }
        ])}
        {renderCheckbox('Show Share Counts', 'showShareCounts')}
      </div>
    );
  }

  // AMA_BLOCK
  if (selectedBlock.type === 'ama') {
    return (
      <div className="space-y-4">
        {renderTextField('Form Title', 'questionFormTitle', 'Ask Me Anything')}
        {renderTextField('Question Placeholder', 'questionPlaceholder', 'Your question...')}
        {renderCheckbox('Require Approval', 'requireApproval')}
        {renderCheckbox('Allow Voting', 'allowVoting')}
        {renderCheckbox('Display Answered Questions', 'displayAnsweredQuestions')}
        {renderSelect('Answer Format', 'answerFormat', [
          { value: 'text', label: 'Text' },
          { value: 'video', label: 'Video' },
          { value: 'audio', label: 'Audio' }
        ])}
        {renderTextField('Moderation Email', 'moderationEmail', 'mod@example.com', 'email')}
        {renderNumberField('Max Question Length', 'maxQuestionLength', 10, 1000)}
      </div>
    );
  }

  // CONTACT_FORM Block
  if (selectedBlock.type === 'contact') {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderTextField('Submit Button Text', 'submitButtonText', 'Send Message')}
        {renderTextArea('Success Message', 'successMessage', 'Thank you for your message!')}
        {renderTextArea('Error Message', 'errorMessage', 'Something went wrong. Please try again.')}
        {renderTextField('Notification Email', 'notificationEmail', 'contact@example.com', 'email')}
        {renderCheckbox('Send Auto Reply', 'sendAutoReply')}
        {renderTextArea('Auto Reply Message', 'autoReplyMessage', 'Thank you for contacting us!')}
        {renderCheckbox('Enable CAPTCHA', 'enableCaptcha')}
        {renderCheckbox('Allow File Upload', 'allowFileUpload')}
        {renderNumberField('Max File Size (MB)', 'maxFileSize', 1, 50)}
      </div>
    );
  }

  // TEXT_BLOCK
  if (selectedBlock.type === 'text') {
    return (
      <div className="space-y-4">
        {renderTextArea('Content', 'content', 'Your text content here...', 5)}
        {renderSelect('Heading Level', 'headingLevel', [
          { value: 'h1', label: 'Heading 1' },
          { value: 'h2', label: 'Heading 2' },
          { value: 'h3', label: 'Heading 3' },
          { value: 'p', label: 'Paragraph' }
        ])}
        {renderSelect('Text Align', 'textAlign', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' }
        ])}
        {renderSelect('Font Size', 'fontSize', [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xl', label: 'Extra Large' }
        ])}
        {renderSelect('Font Weight', 'fontWeight', [
          { value: 'normal', label: 'Normal' },
          { value: 'medium', label: 'Medium' },
          { value: 'bold', label: 'Bold' }
        ])}
        {renderTextField('Text Color', 'textColor', '#000000', 'color')}
        {renderTextField('Background Color', 'backgroundColor', '#FFFFFF', 'color')}
        {renderNumberField('Padding (px)', 'padding', 0, 100)}
        {renderCheckbox('Support Markdown', 'supportMarkdown')}
      </div>
    );
  }

  // DIVIDER Block
  if (selectedBlock.type === 'divider') {
    return (
      <div className="space-y-4">
        {renderSelect('Style', 'style', [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' }
        ])}
        {renderNumberField('Thickness (px)', 'thickness', 1, 20)}
        {renderTextField('Color', 'color', '#E5E7EB', 'color')}
        {renderNumberField('Width (%)', 'width', 1, 100)}
        {renderNumberField('Margin Top (px)', 'marginTop', 0, 100)}
        {renderNumberField('Margin Bottom (px)', 'marginBottom', 0, 100)}
        {renderCheckbox('Show Icon', 'showIcon')}
        {renderTextField('Icon', 'icon', '⭐')}
        {renderCheckbox('Show Text', 'showText')}
        {renderTextField('Text', 'text', 'Divider Text')}
      </div>
    );
  }

  // PORTFOLIO Block
  if (selectedBlock.type === 'portfolio') {
    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {renderTextField('Project Title', 'projectTitle', 'Project Name')}
        {renderTextArea('Project Description', 'projectDescription', 'Project details...', 4)}
        {renderStringArray('Project Images', 'images', 'https://example.com/image.jpg')}
        {renderTextField('Category', 'category', 'Web Design')}
        {renderStringArray('Tags', 'tags', 'React')}
        {renderTextField('Client Name', 'clientName', 'Client Inc.')}
        {renderTextField('Project Date', 'projectDate', 'January 2025')}
        {renderTextArea('Role', 'role', 'Your role and responsibilities')}
        {renderStringArray('Technologies', 'technologies', 'React')}
        {renderTextField('Live URL', 'liveUrl', 'https://project.com', 'url')}
        {renderTextField('Case Study URL', 'caseStudyUrl', 'https://casestudy.com', 'url')}
        {renderCheckbox('Featured Project', 'featured')}
      </div>
    );
  }

  // RSS_FEED Block
  if (selectedBlock.type === 'rss') {
    return (
      <div className="space-y-4">
        {renderTextField('Feed URL', 'feedUrl', 'https://example.com/feed.xml', 'url')}
        {renderNumberField('Item Count', 'itemCount', 1, 50)}
        {renderCheckbox('Show Images', 'showImages')}
        {renderCheckbox('Show Dates', 'showDates')}
        {renderCheckbox('Show Excerpts', 'showExcerpts')}
        {renderNumberField('Excerpt Length', 'excerptLength', 50, 500)}
        {renderSelect('Link Behavior', 'linkBehavior', [
          { value: 'new_tab', label: 'New Tab' },
          { value: 'same_tab', label: 'Same Tab' },
          { value: 'modal', label: 'Modal' }
        ])}
        {renderNumberField('Refresh Interval (minutes)', 'refreshInterval', 5, 1440)}
        {renderSelect('Layout', 'layout', [
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
          { value: 'cards', label: 'Cards' }
        ])}
      </div>
    );
  }

  // GATED_CONTENT Block
  if (selectedBlock.type === 'gated') {
    return (
      <div className="space-y-4">
        {renderSelect('Content Type', 'contentType', [
          { value: 'file', label: 'File' },
          { value: 'video', label: 'Video' },
          { value: 'text', label: 'Text' },
          { value: 'external_link', label: 'External Link' }
        ])}
        {renderSelect('Access Requirement', 'accessRequirement', [
          { value: 'email', label: 'Email' },
          { value: 'payment', label: 'Payment' },
          { value: 'password', label: 'Password' },
          { value: 'membership', label: 'Membership' }
        ])}
        {renderTextArea('Preview Content', 'previewContent', 'Preview text...')}
        {renderTextArea('Unlock Instructions', 'unlockMethod', 'How to unlock this content...')}
        {renderNumberField('Price', 'price', 0)}
        {renderTextField('Currency', 'currency', 'USD')}
        {renderTextField('Password', 'password', '', 'password')}
        {renderTextField('Content URL', 'contentUrl', 'https://example.com/content', 'url')}
        {renderTextField('Success Redirect URL', 'successRedirectUrl', 'https://example.com/success', 'url')}
        {renderNumberField('Access Expiration (hours)', 'expirationHours', 1, 720)}
      </div>
    );
  }

  // CUSTOM Block
  if (selectedBlock.type === 'custom') {
    return (
      <div className="space-y-4">
        {renderTextArea('HTML Content', 'htmlContent', '<div>Your HTML here</div>', 6)}
        {renderTextArea('CSS Styles', 'cssStyles', '.custom { color: blue; }', 4)}
        {renderTextArea('JavaScript Code', 'jsCode', '// Your JS code', 4)}
        {renderTextArea('Embed Code', 'embedCode', '<iframe src="..."></iframe>', 4)}
        {renderCheckbox('Allow Scripts', 'allowScripts')}
        {selectedBlock.data?.allowScripts && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">⚠️ Warning: Enabling scripts can pose security risks. Only use trusted code.</p>
          </div>
        )}
      </div>
    );
  }

  return <div className="text-gray-500">Select a block type to configure</div>;
};

export default BlockFormFields;
