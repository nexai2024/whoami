-- Add industry field to page_templates
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "industry" TEXT;

-- Add theme field to page_templates
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "theme" JSONB;

-- Add rating field to page_templates
ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 0;

-- Update description to use TEXT type if it's not already
-- (This might already be done, but ensuring it's correct)
-- ALTER TABLE "page_templates" ALTER COLUMN "description" TYPE TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "page_templates_category_featured_idx" ON "page_templates"("category", "featured");
CREATE INDEX IF NOT EXISTS "page_templates_industry_idx" ON "page_templates"("industry");
CREATE INDEX IF NOT EXISTS "page_templates_useCount_idx" ON "page_templates"("useCount");

