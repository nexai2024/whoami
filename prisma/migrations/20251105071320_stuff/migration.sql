/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `course_enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'COURSE';

-- AlterTable
ALTER TABLE "course_enrollments" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_accessToken_key" ON "course_enrollments"("accessToken");

-- CreateIndex
CREATE INDEX "course_enrollments_accessToken_idx" ON "course_enrollments"("accessToken");
