import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: "https://a3b764402b0be6f74bc502ed9b3f057e@o4510662650363904.ingest.us.sentry.io/4510664669986816",
  // Adds request headers and IP for users
  sendDefaultPii: true,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: "system",
    }),
  ],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});