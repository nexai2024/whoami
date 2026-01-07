import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover',
    appInfo: { // For sample support and debugging, not required for production:
      name: "WhoAmI",
      version: "0.0.1",
      url: "http://localhost:3000"
    }
  })