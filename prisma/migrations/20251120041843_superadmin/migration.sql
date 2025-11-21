-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'PACKAGE');

-- AlterEnum
--ALTER TYPE "PlanEnum" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "packageProducts" TEXT[],
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PRODUCT';
