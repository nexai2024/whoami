-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'DEEP_LINK';

-- CreateTable
CREATE TABLE "stripe_connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "defaultCurrency" TEXT DEFAULT 'USD',
    "businessType" TEXT,
    "applicationFeePercent" INTEGER,
    "requirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_earnings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "saleId" TEXT,
    "bookingId" TEXT,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "stripeFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "applicationFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "chargeId" TEXT,
    "transferId" TEXT,
    "payoutId" TEXT,
    "connectedAccountId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "availableAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_connected_accounts_userId_key" ON "stripe_connected_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_connected_accounts_accountId_key" ON "stripe_connected_accounts"("accountId");

-- CreateIndex
CREATE INDEX "creator_earnings_userId_status_idx" ON "creator_earnings"("userId", "status");

-- CreateIndex
CREATE INDEX "creator_earnings_connectedAccountId_status_idx" ON "creator_earnings"("connectedAccountId", "status");

-- AddForeignKey
ALTER TABLE "stripe_connected_accounts" ADD CONSTRAINT "stripe_connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
