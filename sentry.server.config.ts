import * as Sentry from "@sentry/nextjs";
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
Sentry.init({
  dsn: "https://a3b764402b0be6f74bc502ed9b3f057e@o4510662650363904.ingest.us.sentry.io/4510664669986816",
  integrations: [
    nodeProfilingIntegration(),
    Sentry.httpIntegration(),
    // Note: nodeProfilingIntegration requires @sentry/profiling-node package
  ],
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Set sampling rate for profiling - this is evaluated only once per SDK.init call
    profileSessionSampleRate: 1.0,
    // Trace lifecycle automatically enables profiling during active traces
    profileLifecycle: 'trace',
  // Session Replay (only on server if needed)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  
  // Enable logs
  enableLogs: true,
  
  // Adds request headers and IP for users
  sendDefaultPii: true,
  
  // Filter out health checks and other noise
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    // Network errors that are expected
    "Network request failed",
    // Sentry itself
    "Failed to send error to Sentry",
  ],
  
  // Filter transactions
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.ENABLE_SENTRY_DEV) {
      return null;
    }
    return event;
  },
  
  // Server-side integrations
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  // Additional options
  maxBreadcrumbs: 50,
  attachStacktrace: true,
});
// Profiling happens automatically after setting it up with `Sentry.init()`.
// All spans (unless those discarded by sampling) will have profiling data attached to them.
Sentry.startSpan({
  name: "My Span",
}, () => {
  // The code executed here will be profiled
});