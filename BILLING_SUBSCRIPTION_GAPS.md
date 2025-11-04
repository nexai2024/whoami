# Billing & Subscription Implementation - Gap Analysis

## Current State

### ✅ What Exists

1. **Database Schema**
   - `Plan` model with features, pricing, intervals
   - `Feature` model for feature definitions
   - `PlanFeature` junction table for plan-feature relationships
   - `Subscription` model with Stripe integration fields
   - `UsageRecord` model for tracking feature usage
   - `Profile` model has `plan`, `stripeCustomerId`, `subscriptionId`, `subscriptionStatus` fields

2. **API Routes**
   - `GET /api/plans` - Fetch all active plans
   - `GET /api/subscriptions?userId=xxx` - Fetch user subscription
   - `POST /api/subscriptions` - Create subscription (manual, no Stripe)
   - `PATCH /api/subscriptions/[id]` - Update subscription
   - `DELETE /api/subscriptions/[id]` - Delete subscription
   - `GET /api/usage?userId=xxx` - Fetch usage records

3. **Stripe Integration**
   - Stripe client configured in `lib/stripe.ts`
   - Stripe webhook handler exists at `/api/webhooks/stripe`
   - Stripe checkout sessions for courses/products
   - Payment intents for one-time purchases

4. **UI Components**
   - Billing page at `/settings/billing` with plan cards, usage meters, modals
   - Settings page integrates billing tab

### ❌ What's Missing

## 1. Authentication & User Context
- **Gap**: Billing page uses hardcoded `userId = 'demo-user'`
- **Fix**: Integrate with Stack Auth to get actual user ID
- **Location**: `app/(main)/settings/billing/page.tsx`

## 2. Stripe Subscription Checkout
- **Gap**: No API endpoint to create Stripe checkout sessions for subscriptions
- **Fix**: Create `/api/subscriptions/checkout` endpoint
- **Features Needed**:
  - Create Stripe customer if doesn't exist
  - Create Stripe checkout session with subscription mode
  - Handle success/cancel redirects
  - Link Stripe customer to Profile

## 3. Stripe Customer Portal
- **Gap**: No way for users to manage billing/payment methods through Stripe portal
- **Fix**: Create `/api/billing/portal` endpoint
- **Features Needed**:
  - Create billing portal session
  - Return portal URL to frontend

## 4. Stripe Webhook Handlers for Subscriptions
- **Gap**: Webhook only handles `payment_intent` and `checkout.session.completed` for courses
- **Missing Events**:
  - `customer.subscription.created` - Create subscription record
  - `customer.subscription.updated` - Update subscription status, plan changes
  - `customer.subscription.deleted` - Cancel subscription
  - `invoice.paid` - Record payment, update billing history
  - `invoice.payment_failed` - Handle failed payments
  - `customer.created` - Link Stripe customer to Profile
- **Fix**: Extend `/api/webhooks/stripe/route.ts`

## 5. Subscription Lifecycle Management
- **Gap**: API routes don't handle Stripe subscription operations properly
- **Missing**:
  - Create/update Stripe subscriptions via API
  - Proration handling for upgrades/downgrades
  - Immediate vs. period-end changes
  - Plan change validation
- **Fix**: Update `/api/subscriptions` routes

## 6. Usage Tracking & Quotas
- **Gap**: Usage API exists but doesn't aggregate or calculate current period usage
- **Missing**:
  - Track feature usage (e.g., page views, storage, API calls)
  - Enforce quotas based on plan limits
  - Reset usage at period boundaries
  - Usage calculation for current billing period
- **Fix**: Enhance `/api/usage/route.ts` and create usage tracking utilities

## 7. Billing History & Invoices
- **Gap**: Billing page shows hardcoded invoice data
- **Missing**:
  - Database model for invoices/payments
  - API endpoint to fetch billing history
  - Integration with Stripe invoices
  - Invoice PDF download links
- **Fix**: Create invoice model and API endpoints

## 8. Database Seed Data
- **Gap**: No Plans or Features seeded in database
- **Fix**: Create seed script or migration to populate:
  - Plans (FREE, CREATOR, PRO, BUSINESS)
  - Features (pages, storage, custom_domains, etc.)
  - PlanFeature relationships

## 9. Profile Synchronization
- **Gap**: Profile.plan and Profile.subscriptionStatus not updated from webhooks
- **Fix**: Update Profile when subscription changes via webhooks

## 10. Authorization & Validation
- **Gap**: Subscription API routes don't validate user ownership
- **Fix**: Add authorization checks in all subscription endpoints

## 11. Plan Tier Logic
- **Gap**: Frontend has `getPlanTier` function but it's not implemented
- **Fix**: Implement plan tier comparison logic

## 12. Error Handling & User Feedback
- **Gap**: Missing toast notifications, error messages
- **Fix**: Add proper error handling and user feedback throughout

## Implementation Priority

### Phase 1: Core Subscription Flow
1. Authentication integration in billing page
2. Stripe checkout session creation for subscriptions
3. Subscription webhook handlers (created, updated, deleted)
4. Profile synchronization

### Phase 2: Management Features
5. Stripe customer portal integration
6. Upgrade/downgrade with proration
7. Plan tier logic and validation

### Phase 3: Advanced Features
8. Usage tracking and quota enforcement
9. Billing history and invoices
10. Database seed data for plans/features

### Phase 4: Polish
11. Authorization improvements
12. Error handling and user feedback
13. Testing and edge case handling
