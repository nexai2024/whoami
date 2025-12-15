-- Migration: Add tables for 5 enhancement features
-- Template Customization, SEO Tracking, Content Optimization, Template Analytics, Marketplace

-- 1. Template Customization Sessions
CREATE TABLE IF NOT EXISTS "template_customizations" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "page_id" TEXT,
    "user_id" TEXT NOT NULL,
    "customizations" JSONB NOT NULL DEFAULT '{}',
    "preview_data" JSONB,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_customizations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "template_customizations_template_id_idx" ON "template_customizations"("template_id");
CREATE INDEX IF NOT EXISTS "template_customizations_user_id_idx" ON "template_customizations"("user_id");
CREATE INDEX IF NOT EXISTS "template_customizations_page_id_idx" ON "template_customizations"("page_id");

-- 2. SEO Performance Tracking
CREATE TABLE IF NOT EXISTS "seo_performance" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "warnings" INTEGER NOT NULL DEFAULT 0,
    "info" INTEGER NOT NULL DEFAULT 0,
    "issues" JSONB,
    "search_ranking" INTEGER,
    "organic_traffic" INTEGER DEFAULT 0,
    "impressions" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "ctr" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_performance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "seo_performance_page_date_unique" ON "seo_performance"("page_id", "date");
CREATE INDEX IF NOT EXISTS "seo_performance_user_id_idx" ON "seo_performance"("user_id");
CREATE INDEX IF NOT EXISTS "seo_performance_date_idx" ON "seo_performance"("date");

-- 3. Content Optimization Suggestions
CREATE TABLE IF NOT EXISTS "content_optimizations" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "block_id" TEXT,
    "user_id" TEXT NOT NULL,
    "suggestion_type" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "current_value" TEXT,
    "suggested_value" TEXT NOT NULL,
    "reason" TEXT,
    "priority" TEXT NOT NULL,
    "impact_score" INTEGER,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" TIMESTAMP(3),

    CONSTRAINT "content_optimizations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "content_optimizations_page_id_idx" ON "content_optimizations"("page_id");
CREATE INDEX IF NOT EXISTS "content_optimizations_user_id_idx" ON "content_optimizations"("user_id");
CREATE INDEX IF NOT EXISTS "content_optimizations_applied_idx" ON "content_optimizations"("applied");

-- 4. Template Performance Analytics
CREATE TABLE IF NOT EXISTS "template_performance" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,2),
    "engagement_time" INTEGER,
    "bounce_rate" DECIMAL(5,2),
    "revenue" DECIMAL(10,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_performance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "template_performance_template_page_date_unique" ON "template_performance"("template_id", "page_id", "date");
CREATE INDEX IF NOT EXISTS "template_performance_template_id_idx" ON "template_performance"("template_id");
CREATE INDEX IF NOT EXISTS "template_performance_user_id_idx" ON "template_performance"("user_id");

-- 5. A/B Test Experiments
CREATE TABLE IF NOT EXISTS "ab_test_experiments" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template_a_id" TEXT NOT NULL,
    "template_b_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "traffic_split" INTEGER NOT NULL DEFAULT 50,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "winner_template_id" TEXT,
    "results" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_experiments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ab_test_experiments_page_id_idx" ON "ab_test_experiments"("page_id");
CREATE INDEX IF NOT EXISTS "ab_test_experiments_user_id_idx" ON "ab_test_experiments"("user_id");
CREATE INDEX IF NOT EXISTS "ab_test_experiments_status_idx" ON "ab_test_experiments"("status");

-- 6. Template Marketplace (Revenue Sharing)
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2);
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "is_paid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "commission_rate" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "total_revenue" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "total_sales" INTEGER DEFAULT 0;
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "license_type" TEXT DEFAULT 'free';

CREATE TABLE IF NOT EXISTS "template_purchases" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commission" DECIMAL(10,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "seller_earnings" DECIMAL(10,2) NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_purchases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "template_purchases_template_id_idx" ON "template_purchases"("template_id");
CREATE INDEX IF NOT EXISTS "template_purchases_buyer_id_idx" ON "template_purchases"("buyer_id");
CREATE INDEX IF NOT EXISTS "template_purchases_seller_id_idx" ON "template_purchases"("seller_id");

CREATE TABLE IF NOT EXISTS "template_reviews" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "template_reviews_template_user_unique" ON "template_reviews"("template_id", "user_id");
CREATE INDEX IF NOT EXISTS "template_reviews_template_id_idx" ON "template_reviews"("template_id");
CREATE INDEX IF NOT EXISTS "template_reviews_rating_idx" ON "template_reviews"("rating");

-- 7. Template Creator Profiles
CREATE TABLE IF NOT EXISTS "template_creator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL UNIQUE,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "total_templates" INTEGER DEFAULT 0,
    "total_sales" INTEGER DEFAULT 0,
    "total_revenue" DECIMAL(10,2) DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_creator_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "template_creator_profiles_user_id_idx" ON "template_creator_profiles"("user_id");






