import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a3b764402b0be6f74bc502ed9b3f057e@o4510662650363904.ingest.us.sentry.io/4510664669986816",
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Performance Monitoring (lower for edge)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
  
  // Enable logs
  enableLogs: true,
  
  // Adds request headers and IP for users
  sendDefaultPii: true,
  
  // Filter out noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "Network request failed",
    "Failed to send error to Sentry",
  ],
  
  // Filter transactions in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development" && !process.env.ENABLE_SENTRY_DEV) {
      return null;
    }
    return event;
  },
  
  // Edge-specific integrations
  // Note: Some integrations may not be available in edge runtime
  integrations: [],
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  // Additional options
  maxBreadcrumbs: 30, // Lower for edge
  attachStacktrace: true,
});