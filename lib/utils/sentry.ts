/**
 * Sentry utility functions for consistent error handling across the application
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Wrap API route handlers with Sentry error capture
 * Usage:
 *   export const GET = withSentry(async (request: NextRequest) => {
 *     // your route handler code
 *   });
 */
export function withSentry<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Capture exception to Sentry
      Sentry.captureException(error, {
        tags: {
          component: "api-route",
        },
        extra: {
          args: args.length > 0 ? JSON.stringify(args[0]) : undefined,
        },
      });
      
      // Re-throw to allow Next.js error handling
      throw error;
    }
  };
}

/**
 * Capture an error to Sentry with context
 */
export function captureError(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
  }
): string {
  const eventId = Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  });
  
  return eventId;
}

/**
 * Capture a message to Sentry (non-error)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): string {
  return Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category: category || "default",
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for Sentry
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}): void {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Wrap async function with transaction tracking
 * Note: Uses Sentry's newer transaction API
 */
export async function withTransaction<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    async (span) => {
      try {
        const result = await fn();
        span?.setStatus({ code: 1, message: "ok" });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: "internal_error" });
        Sentry.captureException(error);
        throw error;
      }
    }
  );
}
