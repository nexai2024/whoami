/*
  Warnings:

  - Added the required column `pageType` to the `email_subscribers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `email_subscribers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_subscribers" ADD COLUMN     "pageType" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "email_subscribers_userId_idx" ON "email_subscribers"("userId");

-- CreateIndex
CREATE INDEX "email_subscribers_pageId_pageType_idx" ON "email_subscribers"("pageId", "pageType");
