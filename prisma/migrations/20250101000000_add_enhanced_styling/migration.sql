-- AlterTable: Add enhanced styling fields to pages
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "theme" JSONB;
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "typography" JSONB;
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" JSONB;
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "animations" JSONB;
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "customCss" TEXT;

-- AlterTable: Add enhanced styling fields to blocks
ALTER TABLE "blocks" ADD COLUMN IF NOT EXISTS "style" JSONB;



