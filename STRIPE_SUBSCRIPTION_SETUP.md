# Stripe Subscription Setup Guide

This document outlines the Stripe subscription setup that has been implemented.

## ✅ What's Been Set Up

### 1. Checkout Endpoint (`/api/checkout/plan`)
- ✅ Retrieves plan from database using `planId`
- ✅ Uses `priceId` from the plan table (Stripe Price ID)
- ✅ Creates or retrieves Stripe customer
- ✅ Links Stripe customer to user via metadata
- ✅ Creates checkout session with proper metadata
- ✅ Fixed success/cancel URLs (removed typos)
- ✅ Returns checkout URL to frontend

### 2. Webhook Handlers (`/api/webhooks`)
The following Stripe webhook events are now handled:

- ✅ `checkout.session.completed` - Handles checkout completion
- ✅ `customer.subscription.created` - Creates subscription in database
- ✅ `customer.subscription.updated` - Updates subscription status and plan
- ✅ `customer.subscription.deleted` - Cancels subscription, downgrades to FREE
- ✅ `invoice.paid` - Logs successful payments
- ✅ `invoice.payment_failed` - Updates subscription to `past_due` status

### 3. Database Integration
- ✅ Subscriptions are automatically created/updated in the database
- ✅ User profiles are updated with plan and subscription status
- ✅ Stripe customer IDs are linked to users
- ✅ Subscription periods are tracked

## 🔧 Configuration Required

### Environment Variables
Make sure these are set in your `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard > Webhooks

# Domain
NEXT_PUBLIC_DOMAIN=https://yourdomain.com # or http://localhost:3000 for local
```

### Stripe Dashboard Setup

1. **Create Products and Prices**
   - Go to Stripe Dashboard > Products
   - Create a product for each plan (e.g., "Creator Plan", "Pro Plan")
   - Create prices for each product (monthly/yearly)
   - Copy the Price ID (starts with `price_...`)

2. **Add Price IDs to Database**
   - Update each plan in your database with the corresponding Stripe Price ID
   - The `priceId` field in the `Plan` table should contain the Stripe Price ID

3. **Set Up Webhooks**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 📋 How It Works

### Checkout Flow

1. User clicks "Get Started" or "Upgrade" on pricing page
2. Frontend calls `/api/checkout/plan` with `planId`
3. Backend:
   - Fetches plan from database
   - Gets `priceId` from plan
   - Creates/retrieves Stripe customer
   - Creates checkout session
   - Returns checkout URL
4. User is redirected to Stripe Checkout
5. After payment, user is redirected to `/checkout/success`

### Webhook Flow

1. Stripe sends webhook event to `/api/webhooks`
2. Webhook handler processes the event:
   - `customer.subscription.created`: Creates subscription record
   - `customer.subscription.updated`: Updates subscription and user profile
   - `customer.subscription.deleted`: Cancels subscription, downgrades to FREE
   - `invoice.payment_failed`: Marks subscription as `past_due`
3. Database is updated automatically

## 🧪 Testing

### Test Mode
- Use Stripe test mode keys (`sk_test_...`, `pk_test_...`)
- Use test card numbers from Stripe docs
- Test webhooks using Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks
  ```

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## 📝 Notes

- The checkout endpoint requires authentication (`x-user-id` header)
- Plans must have a `priceId` set in the database
- Subscriptions are automatically synced between Stripe and your database
- Users are automatically downgraded to FREE plan when subscription is canceled
- Failed payments are tracked and subscriptions marked as `past_due`

## 🚀 Next Steps

1. Add Price IDs to all plans in your database
2. Set up webhook endpoint in Stripe Dashboard
3. Test the checkout flow with test cards
4. Monitor webhook events in Stripe Dashboard
5. Set up email notifications for subscription events (optional)

