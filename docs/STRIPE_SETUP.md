# Stripe Setup

Set the following environment variables:

```env
# Stripe platform secret (Live/TEST)
STRIPE_SECRET_KEY=sk_test_...

# Webhook signing secret from Stripe CLI / Dashboard (for endpoint /api/webhooks/stripe)
STRIPE_WEBHOOK_SECRET=whsec_...

# Mode: 'platform' (single merchant of record) or 'connect' (creators own payouts)
STRIPE_MODE=connect

# Default application fee percent (integer). Used when connected account has no override.
# Example: 10 means 10% of the gross amount.
STRIPE_APP_FEE_PERCENT=10

# Public site base URL for return/refresh links during Connect onboarding
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Local webhook forwarding with Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the displayed signing secret into STRIPE_WEBHOOK_SECRET
```

Connect onboarding:
- POST `/api/stripe/connect/onboard` with `x-user-id` header set to the authenticated user ID.
- GET `/api/stripe/connect/status` with `x-user-id` to read current onboarding/capabilities.

Checkout:
- POST `/api/checkout/payment-intent` with body `{ blockId, email }`.
- If `STRIPE_MODE=connect` and the block's page owner has a connected account with `chargesEnabled`, a destination charge is created with an application fee; otherwise it falls back to platform charge.

Earnings API:
- GET `/api/stripe/earnings` with `x-user-id` returns grouped totals and recent earnings for the creator.









