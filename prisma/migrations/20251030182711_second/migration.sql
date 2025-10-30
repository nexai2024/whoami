-- CreateEnum
CREATE TYPE "FunnelGoalType" AS ENUM ('LEAD_CAPTURE', 'PRODUCT_SALE', 'COURSE_ENROLLMENT', 'BOOKING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FunnelStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FunnelStepType" AS ENUM ('LANDING_PAGE', 'LEAD_CAPTURE', 'SALES_PAGE', 'ORDER_FORM', 'UPSELL', 'DOWNSELL', 'THANK_YOU', 'VIDEO_SALES', 'WEBINAR_REG', 'SURVEY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FunnelStepStatus" AS ENUM ('VIEWED', 'ENGAGED', 'COMPLETED', 'ABANDONED', 'CONVERTED');

-- CreateTable
CREATE TABLE "funnels" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "goalType" "FunnelGoalType" NOT NULL,
    "goalValue" TEXT,
    "conversionGoal" TEXT NOT NULL,
    "theme" JSONB,
    "brandColors" JSONB,
    "customCss" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "trackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "exitRedirect" TEXT,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL(5,2),
    "status" "FunnelStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_steps" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "funnelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "FunnelStepType" NOT NULL,
    "order" INTEGER NOT NULL,
    "headline" TEXT,
    "subheadline" TEXT,
    "content" TEXT,
    "pageData" JSONB,
    "backgroundImage" TEXT,
    "videoUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "formConfig" JSONB,
    "isVariant" BOOLEAN NOT NULL DEFAULT false,
    "variantOf" TEXT,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50,
    "views" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "dropoffRate" DECIMAL(5,2),
    "rules" JSONB,

    CONSTRAINT "funnel_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_visits" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "funnelId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "entryStepId" TEXT NOT NULL,
    "entryUrl" TEXT,
    "referrer" TEXT,
    "currentStepId" TEXT,
    "lastStepId" TEXT,
    "completedSteps" TEXT[],
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "conversionValue" DECIMAL(10,2),

    CONSTRAINT "funnel_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_step_progress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "FunnelStepStatus" NOT NULL DEFAULT 'VIEWED',
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "formData" JSONB,
    "scrollDepth" INTEGER,
    "ctaClicked" BOOLEAN NOT NULL DEFAULT false,
    "videoWatched" INTEGER,
    "interactions" JSONB,

    CONSTRAINT "funnel_step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_conversions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "funnelId" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL,
    "conversionValue" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "entrySource" TEXT,
    "entryMedium" TEXT,
    "entryCampaign" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "metadata" JSONB,
    "orderId" TEXT,
    "productId" TEXT,
    "courseId" TEXT,

    CONSTRAINT "funnel_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funnels_slug_key" ON "funnels"("slug");

-- CreateIndex
CREATE INDEX "funnels_userId_status_idx" ON "funnels"("userId", "status");

-- CreateIndex
CREATE INDEX "funnels_slug_idx" ON "funnels"("slug");

-- CreateIndex
CREATE INDEX "funnel_steps_funnelId_order_idx" ON "funnel_steps"("funnelId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_steps_funnelId_slug_key" ON "funnel_steps"("funnelId", "slug");

-- CreateIndex
CREATE INDEX "funnel_visits_funnelId_visitorId_idx" ON "funnel_visits"("funnelId", "visitorId");

-- CreateIndex
CREATE INDEX "funnel_visits_funnelId_converted_idx" ON "funnel_visits"("funnelId", "converted");

-- CreateIndex
CREATE INDEX "funnel_visits_email_idx" ON "funnel_visits"("email");

-- CreateIndex
CREATE INDEX "funnel_step_progress_stepId_status_idx" ON "funnel_step_progress"("stepId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_step_progress_visitId_stepId_key" ON "funnel_step_progress"("visitId", "stepId");

-- CreateIndex
CREATE INDEX "funnel_conversions_funnelId_createdAt_idx" ON "funnel_conversions"("funnelId", "createdAt");

-- CreateIndex
CREATE INDEX "funnel_conversions_email_idx" ON "funnel_conversions"("email");

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_visits" ADD CONSTRAINT "funnel_visits_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_step_progress" ADD CONSTRAINT "funnel_step_progress_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "funnel_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_step_progress" ADD CONSTRAINT "funnel_step_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "funnel_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_conversions" ADD CONSTRAINT "funnel_conversions_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
