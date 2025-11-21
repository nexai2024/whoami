-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('EMAIL_CAPTURE', 'WAITLIST', 'CONTACT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PlanEnum" AS ENUM ('FREE', 'CREATOR', 'PRO', 'BUSINESS', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('LINK', 'PRODUCT', 'EMAIL_CAPTURE', 'IMAGE_GALLERY', 'MUSIC_PLAYER', 'VIDEO_EMBED', 'BOOKING_CALENDAR', 'TIP_JAR', 'SOCIAL_FEED', 'AMA_BLOCK', 'GATED_CONTENT', 'RSS_FEED', 'PORTFOLIO', 'CONTACT_FORM', 'DIVIDER', 'TEXT_BLOCK', 'ANALYTICS', 'PROMO', 'DISCOUNT', 'SOCIAL_SHARE', 'WAITLIST', 'NEWSLETTER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('STRIPE', 'PAYPAL', 'MAILCHIMP', 'CONVERTKIT', 'CALENDLY', 'SHOPIFY', 'GUMROAD', 'GOOGLE_ANALYTICS', 'FACEBOOK_PIXEL', 'ZAPIER');

-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('PAGE_VIEW', 'BLOCK_CLICK', 'EMAIL_SIGNUP', 'PRODUCT_SALE', 'TIP_RECEIVED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('SOCIAL_POST', 'EMAIL', 'PAGE_VARIANT', 'IMAGE', 'VIDEO_CLIP');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TWITTER', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 'EMAIL', 'LINK_IN_BIO');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('DRAFT', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'VIMEO', 'BLOG', 'MEDIUM', 'SUBSTACK', 'LINKEDIN_ARTICLE', 'TWITTER_THREAD', 'PODCAST_RSS', 'PODCAST_MP3', 'SPOTIFY', 'APPLE_PODCASTS', 'MANUAL_TEXT');

-- CreateEnum
CREATE TYPE "RepurposeStatus" AS ENUM ('ANALYZING', 'EXTRACTING', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "RepurposeAssetType" AS ENUM ('TWITTER_THREAD', 'LINKEDIN_POST', 'INSTAGRAM_CAPTION', 'FACEBOOK_POST', 'EMAIL_NEWSLETTER', 'BLOG_SUMMARY', 'QUOTE_GRAPHIC', 'CAROUSEL_SLIDE', 'INFOGRAPHIC', 'VIDEO_CLIP', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('FEED_POST', 'STORY', 'REEL', 'TWEET', 'THREAD', 'LINKEDIN_POST', 'FACEBOOK_POST');

-- CreateEnum
CREATE TYPE "SchedulingMode" AS ENUM ('SUGGESTION', 'AUTO_POST', 'HYBRID');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('BIO_ONLY', 'FULL_PAGE');

-- CreateEnum
CREATE TYPE "MagnetType" AS ENUM ('PDF', 'EBOOK', 'TEMPLATE', 'CHECKLIST', 'WORKBOOK', 'VIDEO', 'VIDEO_COURSE', 'AUDIO', 'SPREADSHEET', 'ZIP_BUNDLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('INSTANT_DOWNLOAD', 'EMAIL_DELIVERY', 'GATED_ACCESS', 'HYBRID', 'DRIP_COURSE');

-- CreateEnum
CREATE TYPE "MagnetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('CHECKLIST', 'WORKBOOK', 'CHEAT_SHEET', 'RESOURCE_LIST', 'SWIPE_FILE', 'GUIDE', 'PLANNER', 'TRACKER', 'EBOOK', 'MINI_COURSE');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "CourseAccessType" AS ENUM ('FREE', 'PAID', 'EMAIL_GATE', 'MEMBERSHIP');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('TEXT', 'VIDEO', 'AUDIO', 'EMBED', 'PDF', 'MIXED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'DOCUMENT', 'SPREADSHEET', 'VIDEO', 'AUDIO', 'IMAGE', 'ARCHIVE', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('NEW_SUBSCRIBER', 'NEW_COURSE_ENROLLMENT', 'LESSON_COMPLETED', 'COURSE_COMPLETED', 'FORM_SUBMITTED', 'PRODUCT_PURCHASED', 'PAGE_VIEWED', 'BLOCK_CLICKED', 'TAG_ADDED', 'TAG_REMOVED', 'SCHEDULE', 'WEBHOOK', 'MANUAL');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('SEND_EMAIL', 'ADD_TAG', 'REMOVE_TAG', 'SUBSCRIBE_TO_LIST', 'UNSUBSCRIBE_FROM_LIST', 'ENROLL_IN_COURSE', 'GRANT_ACCESS', 'REVOKE_ACCESS', 'SEND_SMS', 'SEND_WEBHOOK', 'CREATE_TASK', 'UPDATE_SUBSCRIBER', 'SEND_NOTIFICATION', 'WAIT', 'DELAY', 'CONDITION', 'BRANCH', 'SPLIT_TEST', 'ZAPIER_WEBHOOK', 'MAILCHIMP_ACTION', 'CONVERTKIT_ACTION', 'STRIPE_ACTION');

-- CreateEnum
CREATE TYPE "DelayUnit" AS ENUM ('MINUTES', 'HOURS', 'DAYS', 'WEEKS');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StepExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "plan" "PlanEnum" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customDomain" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "buttonStyle" TEXT NOT NULL DEFAULT 'rounded',
    "fontFamily" TEXT NOT NULL DEFAULT 'inter',
    "googleAnalyticsId" TEXT,
    "facebookPixelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pageHeader" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pageHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "borderRadius" INTEGER NOT NULL DEFAULT 8,
    "data" JSONB NOT NULL DEFAULT '{}',
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,
    "analyticsId" TEXT,
    "formId" TEXT,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "blockId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mobileViews" INTEGER NOT NULL DEFAULT 0,
    "desktopViews" INTEGER NOT NULL DEFAULT 0,
    "tabletViews" INTEGER NOT NULL DEFAULT 0,
    "directTraffic" INTEGER NOT NULL DEFAULT 0,
    "socialTraffic" INTEGER NOT NULL DEFAULT 0,
    "searchTraffic" INTEGER NOT NULL DEFAULT 0,
    "referralTraffic" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fileUrl" TEXT,
    "downloadLimit" INTEGER,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscribers" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trafficSplit" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "status" "TestStatus" NOT NULL DEFAULT 'DRAFT',
    "controlClicks" INTEGER NOT NULL DEFAULT 0,
    "controlViews" INTEGER NOT NULL DEFAULT 0,
    "variantClicks" INTEGER NOT NULL DEFAULT 0,
    "variantViews" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" "WebhookEvent"[],
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "errorType" TEXT,
    "url" TEXT,
    "pathname" TEXT,
    "userAgent" TEXT,
    "componentStack" TEXT,
    "userEmail" TEXT,
    "userPlan" TEXT,
    "context" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "planEnum" "PlanEnum" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "interval" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "limit" INTEGER,
    "rateLimit" INTEGER,
    "ratePeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "productId" TEXT,
    "blockId" TEXT,
    "customContent" JSONB,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "targetAudience" TEXT,
    "analyticsId" TEXT,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_assets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "platform" "Platform",
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "campaign_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repurposed_contents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "sourceTitle" TEXT,
    "sourceMeta" JSONB,
    "transcript" TEXT,
    "keyPoints" JSONB,
    "duration" INTEGER,
    "status" "RepurposeStatus" NOT NULL,
    "error" TEXT,
    "brandColors" JSONB,
    "brandLogo" TEXT,

    CONSTRAINT "repurposed_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repurposed_assets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "repurposedContentId" TEXT NOT NULL,
    "type" "RepurposeAssetType" NOT NULL,
    "platform" "Platform",
    "content" TEXT,
    "mediaUrl" TEXT,
    "metadata" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "blockId" TEXT,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "originalContent" TEXT,

    CONSTRAINT "repurposed_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "platform" "Platform" NOT NULL,
    "platformType" "PostType" NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" "ScheduleStatus" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "externalUrl" TEXT,
    "autoPost" BOOLEAN NOT NULL DEFAULT false,
    "campaignAssetId" TEXT,
    "repurposedAssetId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "views" INTEGER,
    "clicks" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimal_time_slots" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "platform" "Platform",
    "avgEngagementRate" DECIMAL(5,2) NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "confidence" DECIMAL(5,2) NOT NULL,
    "rank" INTEGER NOT NULL,
    "analyzedFrom" TIMESTAMP(3) NOT NULL,
    "analyzedTo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optimal_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultMode" "SchedulingMode" NOT NULL DEFAULT 'SUGGESTION',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "noPostBefore" INTEGER NOT NULL DEFAULT 8,
    "noPostAfter" INTEGER NOT NULL DEFAULT 22,
    "excludedDays" INTEGER[],
    "preferredPlatforms" "Platform"[],
    "minHoursBetween" INTEGER NOT NULL DEFAULT 4,
    "maxPostsPerDay" INTEGER NOT NULL DEFAULT 5,
    "dataRequirement" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "scheduling_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "type" "MagnetType" NOT NULL,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "fileName" TEXT,
    "mimeType" TEXT,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "benefits" TEXT[],
    "coverImageUrl" TEXT,
    "brandColors" JSONB,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "deliveryDelay" INTEGER NOT NULL DEFAULT 0,
    "dripEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dripSchedule" JSONB,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "optIns" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(5,2),
    "emailCaptureBlockId" TEXT,
    "status" "MagnetStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "lead_magnets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnet_assets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadMagnetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "dripDay" INTEGER,

    CONSTRAINT "lead_magnet_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnet_deliveries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadMagnetId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailSubscriberId" TEXT,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "downloadedCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailOpened" BOOLEAN NOT NULL DEFAULT false,
    "emailClickedLink" BOOLEAN NOT NULL DEFAULT false,
    "currentAssetIndex" INTEGER NOT NULL DEFAULT 0,
    "completedAssets" TEXT[],
    "deliveryToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,

    CONSTRAINT "lead_magnet_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_magnet_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "type" "MagnetType" NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "templateUrl" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "samplePrompt" TEXT,

    CONSTRAINT "lead_magnet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "downloadLimit" INTEGER,
    "category" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "postType" "PostType" NOT NULL,
    "mediaUrls" TEXT[],
    "category" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "post_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "targetAudience" TEXT,
    "platforms" "Platform"[],
    "tone" TEXT,
    "category" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "campaign_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "templateType" "TemplateType" NOT NULL,
    "headerData" JSONB NOT NULL,
    "blocksData" JSONB NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "page_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "estimatedTime" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'en',
    "coverImageUrl" TEXT,
    "promoVideoUrl" TEXT,
    "accessType" "CourseAccessType" NOT NULL DEFAULT 'FREE',
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "leadMagnetId" TEXT,
    "isLeadMagnet" BOOLEAN NOT NULL DEFAULT false,
    "requiresEmail" BOOLEAN NOT NULL DEFAULT false,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2),
    "averageRating" DECIMAL(3,2),
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_lessons" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "contentType" "LessonContentType" NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "videoLength" INTEGER,
    "audioUrl" TEXT,
    "hasQuiz" BOOLEAN NOT NULL DEFAULT false,
    "quizData" JSONB,
    "dripDay" INTEGER,
    "dripAfterLesson" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2),
    "avgTimeSpent" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_resources" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "enrollmentSource" TEXT,
    "paymentStatus" TEXT,
    "paymentAmount" DECIMAL(10,2),
    "stripePaymentId" TEXT,
    "currentLessonId" TEXT,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    "certificateIssuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "accessRevoked" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessedAt" TIMESTAMP(3),
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_lesson_progress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "quizAttempts" INTEGER NOT NULL DEFAULT 0,
    "quizScore" DECIMAL(5,2),
    "quizPassedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "course_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_reviews" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canvasData" JSONB,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "lastRunAt" TIMESTAMP(3),
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_triggers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "config" JSONB NOT NULL,
    "filters" JSONB,

    CONSTRAINT "workflow_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StepType" NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "parentStepId" TEXT,
    "condition" JSONB,
    "delayAmount" INTEGER,
    "delayUnit" "DelayUnit",

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "triggerData" JSONB NOT NULL,
    "subscriberEmail" TEXT,
    "error" TEXT,
    "errorStep" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "StepExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "input" JSONB,
    "output" JSONB,
    "error" TEXT,

    CONSTRAINT "workflow_step_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedSteps" TEXT[],
    "currentStep" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "tourCompleted" BOOLEAN NOT NULL DEFAULT false,
    "checklistProgress" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pageHeader_pageId_key" ON "pageHeader"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_userId_date_key" ON "analytics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscribers_pageId_email_key" ON "email_subscribers"("pageId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_userId_type_key" ON "integrations"("userId", "type");

-- CreateIndex
CREATE INDEX "error_logs_userId_timestamp_idx" ON "error_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_resolved_timestamp_idx" ON "error_logs"("resolved", "timestamp");

-- CreateIndex
CREATE INDEX "error_logs_errorType_timestamp_idx" ON "error_logs"("errorType", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_name_idx" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "Feature_name_idx" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "PlanFeature_planId_idx" ON "PlanFeature"("planId");

-- CreateIndex
CREATE INDEX "PlanFeature_featureId_idx" ON "PlanFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "UsageRecord_userId_featureId_periodStart_idx" ON "UsageRecord"("userId", "featureId", "periodStart");

-- CreateIndex
CREATE INDEX "UsageRecord_periodEnd_idx" ON "UsageRecord"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_userId_featureId_periodStart_key" ON "UsageRecord"("userId", "featureId", "periodStart");

-- CreateIndex
CREATE INDEX "campaigns_userId_status_idx" ON "campaigns"("userId", "status");

-- CreateIndex
CREATE INDEX "campaign_assets_campaignId_idx" ON "campaign_assets"("campaignId");

-- CreateIndex
CREATE INDEX "repurposed_contents_userId_status_idx" ON "repurposed_contents"("userId", "status");

-- CreateIndex
CREATE INDEX "repurposed_assets_repurposedContentId_idx" ON "repurposed_assets"("repurposedContentId");

-- CreateIndex
CREATE INDEX "scheduled_posts_userId_scheduledFor_status_idx" ON "scheduled_posts"("userId", "scheduledFor", "status");

-- CreateIndex
CREATE INDEX "scheduled_posts_scheduledFor_status_idx" ON "scheduled_posts"("scheduledFor", "status");

-- CreateIndex
CREATE INDEX "optimal_time_slots_userId_rank_idx" ON "optimal_time_slots"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "optimal_time_slots_userId_platform_dayOfWeek_hourOfDay_key" ON "optimal_time_slots"("userId", "platform", "dayOfWeek", "hourOfDay");

-- CreateIndex
CREATE UNIQUE INDEX "scheduling_preferences_userId_key" ON "scheduling_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_magnets_slug_key" ON "lead_magnets"("slug");

-- CreateIndex
CREATE INDEX "lead_magnets_userId_status_idx" ON "lead_magnets"("userId", "status");

-- CreateIndex
CREATE INDEX "lead_magnet_assets_leadMagnetId_order_idx" ON "lead_magnet_assets"("leadMagnetId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lead_magnet_deliveries_deliveryToken_key" ON "lead_magnet_deliveries"("deliveryToken");

-- CreateIndex
CREATE INDEX "lead_magnet_deliveries_leadMagnetId_email_idx" ON "lead_magnet_deliveries"("leadMagnetId", "email");

-- CreateIndex
CREATE INDEX "lead_magnet_deliveries_deliveryToken_idx" ON "lead_magnet_deliveries"("deliveryToken");

-- CreateIndex
CREATE INDEX "product_templates_userId_category_idx" ON "product_templates"("userId", "category");

-- CreateIndex
CREATE INDEX "product_templates_featured_useCount_idx" ON "product_templates"("featured", "useCount");

-- CreateIndex
CREATE INDEX "post_templates_userId_platform_idx" ON "post_templates"("userId", "platform");

-- CreateIndex
CREATE INDEX "post_templates_featured_useCount_idx" ON "post_templates"("featured", "useCount");

-- CreateIndex
CREATE INDEX "campaign_templates_userId_category_idx" ON "campaign_templates"("userId", "category");

-- CreateIndex
CREATE INDEX "campaign_templates_featured_useCount_idx" ON "campaign_templates"("featured", "useCount");

-- CreateIndex
CREATE INDEX "page_templates_userId_category_idx" ON "page_templates"("userId", "category");

-- CreateIndex
CREATE INDEX "page_templates_featured_useCount_idx" ON "page_templates"("featured", "useCount");

-- CreateIndex
CREATE INDEX "page_templates_category_templateType_idx" ON "page_templates"("category", "templateType");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_userId_status_idx" ON "courses"("userId", "status");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_status_idx" ON "courses"("category", "status");

-- CreateIndex
CREATE INDEX "course_lessons_courseId_order_idx" ON "course_lessons"("courseId", "order");

-- CreateIndex
CREATE INDEX "lesson_resources_lessonId_idx" ON "lesson_resources"("lessonId");

-- CreateIndex
CREATE INDEX "course_enrollments_courseId_progressPercentage_idx" ON "course_enrollments"("courseId", "progressPercentage");

-- CreateIndex
CREATE INDEX "course_enrollments_email_idx" ON "course_enrollments"("email");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_courseId_email_key" ON "course_enrollments"("courseId", "email");

-- CreateIndex
CREATE INDEX "course_lesson_progress_enrollmentId_status_idx" ON "course_lesson_progress"("enrollmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_lesson_progress_enrollmentId_lessonId_key" ON "course_lesson_progress"("enrollmentId", "lessonId");

-- CreateIndex
CREATE INDEX "course_reviews_courseId_approved_idx" ON "course_reviews"("courseId", "approved");

-- CreateIndex
CREATE INDEX "workflows_userId_status_idx" ON "workflows"("userId", "status");

-- CreateIndex
CREATE INDEX "workflows_userId_enabled_idx" ON "workflows"("userId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_triggers_workflowId_key" ON "workflow_triggers"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_triggers_triggerType_idx" ON "workflow_triggers"("triggerType");

-- CreateIndex
CREATE INDEX "workflow_steps_workflowId_order_idx" ON "workflow_steps"("workflowId", "order");

-- CreateIndex
CREATE INDEX "workflow_executions_workflowId_status_idx" ON "workflow_executions"("workflowId", "status");

-- CreateIndex
CREATE INDEX "workflow_executions_status_createdAt_idx" ON "workflow_executions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "workflow_executions_subscriberEmail_idx" ON "workflow_executions"("subscriberEmail");

-- CreateIndex
CREATE INDEX "workflow_step_logs_executionId_stepId_idx" ON "workflow_step_logs"("executionId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_userId_key" ON "user_onboarding"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pageHeader" ADD CONSTRAINT "pageHeader_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "analytics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_assets" ADD CONSTRAINT "campaign_assets_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repurposed_contents" ADD CONSTRAINT "repurposed_contents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repurposed_assets" ADD CONSTRAINT "repurposed_assets_repurposedContentId_fkey" FOREIGN KEY ("repurposedContentId") REFERENCES "repurposed_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimal_time_slots" ADD CONSTRAINT "optimal_time_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_preferences" ADD CONSTRAINT "scheduling_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_magnets" ADD CONSTRAINT "lead_magnets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_magnet_assets" ADD CONSTRAINT "lead_magnet_assets_leadMagnetId_fkey" FOREIGN KEY ("leadMagnetId") REFERENCES "lead_magnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_magnet_deliveries" ADD CONSTRAINT "lead_magnet_deliveries_leadMagnetId_fkey" FOREIGN KEY ("leadMagnetId") REFERENCES "lead_magnets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_templates" ADD CONSTRAINT "product_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_templates" ADD CONSTRAINT "post_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_templates" ADD CONSTRAINT "campaign_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_templates" ADD CONSTRAINT "page_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lesson_progress" ADD CONSTRAINT "course_lesson_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "course_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lesson_progress" ADD CONSTRAINT "course_lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_logs" ADD CONSTRAINT "workflow_step_logs_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_logs" ADD CONSTRAINT "workflow_step_logs_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "workflow_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
