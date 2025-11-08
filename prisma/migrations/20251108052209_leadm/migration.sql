-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "email_subscribers" ADD COLUMN     "company" TEXT,
ADD COLUMN     "estimatedValue" INTEGER,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pipelineStage" "LeadStage" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "email_subscribers_userId_pipelineStage_idx" ON "email_subscribers"("userId", "pipelineStage");

-- CreateIndex
CREATE INDEX "email_subscribers_pipelineStage_idx" ON "email_subscribers"("pipelineStage");
