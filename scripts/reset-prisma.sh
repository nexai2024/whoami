#!/bin/bash

# Prisma Reset Script
# This script completely resets Prisma and prepares for a new database

set -e  # Exit on error

echo "🔄 Prisma Reset Script"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL in your .env or .env.local file"
    echo "Example: DATABASE_URL=\"postgresql://user:pass@host:5432/db?schema=public\""
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
echo ""

# Confirm before proceeding
read -p "⚠️  This will RESET your database. All data will be lost. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Resetting database (this will drop all tables)..."
npx prisma migrate reset --force

echo ""
echo "Step 3: Creating fresh migration..."
npx prisma migrate dev --name init_fresh

echo ""
echo "Step 4: Generating Prisma Client (final)..."
npx prisma generate

echo ""
echo -e "${GREEN}✅ Prisma reset complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify connection: npx prisma studio"
echo "2. Seed database (if needed): npx prisma db seed"
echo "3. Test your application"

