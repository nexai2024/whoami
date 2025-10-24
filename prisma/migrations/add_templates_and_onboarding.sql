-- Add Product Templates
CREATE TABLE "product_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "downloadLimit" INTEGER,
    "category" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "product_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add Post Templates
CREATE TABLE "post_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "postType" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "category" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "post_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add Campaign Templates
CREATE TABLE "campaign_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "targetAudience" TEXT,
    "platforms" TEXT[],
    "tone" TEXT,
    "category" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "campaign_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add User Onboarding Progress
CREATE TABLE "user_onboarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedSteps" TEXT[],
    "currentStep" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "tourCompleted" BOOLEAN NOT NULL DEFAULT false,
    "checklistProgress" JSONB DEFAULT '{}',
    CONSTRAINT "user_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "product_templates_userId_category_idx" ON "product_templates"("userId", "category");
CREATE INDEX "product_templates_featured_useCount_idx" ON "product_templates"("featured" DESC, "useCount" DESC);
CREATE INDEX "post_templates_userId_platform_idx" ON "post_templates"("userId", "platform");
CREATE INDEX "post_templates_featured_useCount_idx" ON "post_templates"("featured" DESC, "useCount" DESC);
CREATE INDEX "campaign_templates_userId_category_idx" ON "campaign_templates"("userId", "category");
CREATE INDEX "campaign_templates_featured_useCount_idx" ON "campaign_templates"("featured" DESC, "useCount" DESC);
