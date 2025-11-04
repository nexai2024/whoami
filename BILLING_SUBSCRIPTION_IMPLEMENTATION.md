# Billing & Subscription Implementation Guide

This document tracks the implementation of billing and subscription features.

## Phase 1: Core Subscription Flow ✅ (In Progress)

### 1.1 Authentication Integration
- [ ] Update billing page to use Stack Auth user context
- [ ] Replace hardcoded `userId = 'demo-user'` with actual user ID

### 1.2 Stripe Subscription Checkout
- [ ] Create `/api/subscriptions/checkout` endpoint
- [ ] Handle Stripe customer creation/linking
- [ ] Create checkout session with subscription mode
- [ ] Handle success/cancel redirects

### 1.3 Subscription Webhook Handlers
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Handle `invoice.paid`
- [ ] Handle `invoice.payment_failed`

### 1.4 Profile Synchronization
ii1- [x] Display invoices in UI
- [x] Add invoice download/view links

### 3.3 Database Seed Data ✅
- [x] Create seed script for Plans
- [x] Create seed script for Features
- [x] Define PlanFeature relationships

## Phase 4: Polish

### 4.1 Authorization ✅
- [x] Add user ownership validation to all subscription endpoints
- [x] Ensure users can only access their own subscriptions

### 4.2 Error Handling
- [ ] Add comprehensive error handling
- [ ] Improve user feedback with toast notifications
- [ ] Handle edge cases

## Running the Seed Script

To populate the database with Plans, Features, and PlanFeature relationships, run:

```bash
# Using npx (recommended)
npx tsx prisma/seed.ts

# Or add to package.json scripts:
# "prisma:seed": "tsx prisma/seed.ts"
# Then run: npm run prisma:seed
```

The seed script will:
1. Create 14 features (pages, storage_gb, custom_domains, etc.)
2. Create 4 plans (Free, Creator, Pro, Business)
3. Link features to each plan with appropriate limits and enabled status

All operations are idempotent - running the script multiple times is safe.
