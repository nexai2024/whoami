/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `pages` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "customDomainStatus" "DomainStatus" DEFAULT 'PENDING',
ADD COLUMN     "customDomainVerificationToken" TEXT,
ADD COLUMN     "customDomainVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "subdomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pages_subdomain_key" ON "pages"("subdomain");
