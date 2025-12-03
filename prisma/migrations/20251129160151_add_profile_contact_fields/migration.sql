-- Add contact information fields to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';





