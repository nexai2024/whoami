-- AlterEnum
-- Add SAAS_APP to BlockType enum
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'SAAS_APP';

