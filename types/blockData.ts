/**
 * TypeScript interfaces for block-specific data structures
 * Each block type has a corresponding interface defining its data field properties
 */

// Marketing & Sales Blocks

export interface ProductBlockData {
  price: number;
  originalPrice?: number;
  currency?: string;
  description?: string;
  longDescription?: string;
  images?: string[];
  features?: string[];
  averageRating?: number;
  reviewCount?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'backorder';
  sku?: string;
  category?: string;
  tags?: string[];
  specifications?: Record<string, string>;
  shippingInfo?: string;
  returnPolicy?: string;
  buttonText?: string;
  productUrl?: string;
}

export interface PromoBlockData {
  promoCode: string;
  description?: string;
  discountAmount?: number;
  discountPercentage?: number;
  validFrom?: string;
  validTo?: string;
  terms?: string;
  usageLimit?: number;
  minPurchase?: number;
  applicableProducts?: string[];
  showCopyButton?: boolean;
}

export interface DiscountBlockData {
  discountPercentage?: number;
  discountAmount?: number;
  description?: string;
  code?: string;
  codeRequired?: boolean;
  validFrom?: string;
  validTo?: string;
  showCountdown?: boolean;
  terms?: string;
  autoApply?: boolean;
}

// Content & Media Blocks

export interface LinkBlockData {
  url: string;
  description?: string;
  thumbnail?: string;
  badge?: string;
  openInNewTab?: boolean;
  trackClicks?: boolean;
  buttonStyle?: 'default' | 'primary' | 'outline';
}

export interface ImageGalleryBlockData {
  images: Array<{
    url: string;
    caption?: string;
    altText?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel' | 'slider';
  clickBehavior?: 'lightbox' | 'link' | 'none';
  aspectRatio?: string;
  spacing?: number;
  maxImages?: number;
  showLoadMore?: boolean;
}

export interface MusicPlayerBlockData {
  trackTitle: string;
  artistName?: string;
  albumName?: string;
  albumArtwork?: string;
  audioUrl: string;
  duration?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  soundcloudUrl?: string;
  downloadUrl?: string;
  lyricsUrl?: string;
  purchaseUrl?: string;
}

export interface VideoEmbedBlockData {
  videoUrl: string;
  platform?: 'youtube' | 'vimeo' | 'custom';
  thumbnailUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  startTime?: number;
  endTime?: number;
  aspectRatio?: string;
}

// Lead Generation Blocks

export interface EmailCaptureBlockData {
  description: string;
  placeholderText?: string;
  buttonText?: string;
  successMessage?: string;
  fieldsToCollect?: {
    name?: boolean;
    phone?: boolean;
  };
  privacyPolicyUrl?: string;
  consentText?: string;
  requireConsent?: boolean;
  sendWelcomeEmail?: boolean;
  listId?: string;
  integrationProvider?: 'mailchimp' | 'convertkit' | 'custom';
}

export type NewsletterBlockData = EmailCaptureBlockData;

export interface WaitlistBlockData extends EmailCaptureBlockData {
  waitlistPosition?: boolean;
  totalWaitlist?: boolean;
  estimatedWaitTime?: string;
}

export interface ContactFormBlockData {
  formFields: Array<{
    fieldName: string;
    fieldLabel: string;
    fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  notificationEmail?: string;
  sendAutoReply?: boolean;
  autoReplyMessage?: string;
  enableCaptcha?: boolean;
  allowFileUpload?: boolean;
  maxFileSize?: number;
}

// Engagement Blocks

export interface SocialShareBlockData {
  platforms: {
    facebook?: boolean;
    twitter?: boolean;
    linkedin?: boolean;
    pinterest?: boolean;
    whatsapp?: boolean;
    email?: boolean;
  };
  shareText?: string;
  hashtags?: string[];
  shareUrl?: string;
  buttonStyle?: 'icons' | 'buttons' | 'text';
  showShareCounts?: boolean;
}

export interface TipJarBlockData {
  message?: string;
  suggestedAmounts?: number[];
  allowCustomAmount?: boolean;
  currency?: string;
  paymentProvider?: 'stripe' | 'paypal' | 'custom';
  thankYouMessage?: string;
  showSupporterNames?: boolean;
  goalAmount?: number;
  currentAmount?: number;
  showGoalProgress?: boolean;
}

export interface SocialFeedBlockData {
  platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok';
  username: string;
  feedType?: 'posts' | 'stories' | 'timeline';
  itemCount?: number;
  layout?: 'grid' | 'carousel' | 'list';
  refreshInterval?: number;
  apiToken?: string;
}

export interface AmaBlockData {
  questionFormTitle?: string;
  questionPlaceholder?: string;
  requireApproval?: boolean;
  allowVoting?: boolean;
  displayAnsweredQuestions?: boolean;
  answerFormat?: 'text' | 'video' | 'audio';
  moderationEmail?: string;
  maxQuestionLength?: number;
}

// Content Display Blocks

export interface TextBlockData {
  content: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'p';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'bold';
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
  supportMarkdown?: boolean;
}

export interface DividerBlockData {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
  showIcon?: boolean;
  icon?: string;
  showText?: boolean;
  text?: string;
}

export interface PortfolioBlockData {
  projectTitle: string;
  projectDescription?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  clientName?: string;
  projectDate?: string;
  role?: string;
  technologies?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
}

export interface RssFeedBlockData {
  feedUrl: string;
  itemCount?: number;
  showImages?: boolean;
  showDates?: boolean;
  showExcerpts?: boolean;
  excerptLength?: number;
  linkBehavior?: 'new_tab' | 'same_tab' | 'modal';
  refreshInterval?: number;
  layout?: 'list' | 'grid' | 'cards';
}

// Advanced Blocks

export interface BookingCalendarBlockData {
  serviceType?: string;
  duration?: number;
  price?: number;
  calendarIntegration?: 'calendly' | 'cal.com' | 'google' | 'custom';
  calendarUrl?: string;
  timezone?: string;
  bufferTime?: number;
  maxBookingsPerDay?: number;
  bookingButtonText?: string;
  confirmationMessage?: string;
  cancellationPolicy?: string;
}

export interface GatedContentBlockData {
  contentType?: 'file' | 'video' | 'text' | 'external_link';
  accessRequirement?: 'email' | 'payment' | 'password' | 'membership';
  previewContent?: string;
  unlockMethod?: string;
  price?: number;
  currency?: string;
  password?: string;
  successRedirectUrl?: string;
  contentUrl?: string;
  expirationHours?: number;
}

export interface AnalyticsBlockData {
  source?: string; // Legacy field
  provider?: 'google' | 'plausible' | 'fathom' | 'custom';
  trackingId?: string;
  eventsToTrack?: string[];
  goals?: Array<{
    goalName: string;
    goalValue: number;
  }>;
  customDimensions?: Record<string, string>;
  dataRetentionDays?: number;
}

export interface CustomBlockData {
  htmlContent?: string;
  cssStyles?: string;
  jsCode?: string;
  embedCode?: string;
  allowScripts?: boolean;
}

// Union type for all block data types
export type BlockData =
  | ProductBlockData
  | PromoBlockData
  | DiscountBlockData
  | LinkBlockData
  | ImageGalleryBlockData
  | MusicPlayerBlockData
  | VideoEmbedBlockData
  | EmailCaptureBlockData
  | NewsletterBlockData
  | WaitlistBlockData
  | ContactFormBlockData
  | SocialShareBlockData
  | TipJarBlockData
  | SocialFeedBlockData
  | AmaBlockData
  | TextBlockData
  | DividerBlockData
  | PortfolioBlockData
  | RssFeedBlockData
  | BookingCalendarBlockData
  | GatedContentBlockData
  | AnalyticsBlockData
  | CustomBlockData;
