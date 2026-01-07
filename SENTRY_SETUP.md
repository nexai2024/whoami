# Sentry Setup Documentation

This document outlines the Sentry error monitoring setup for the WhoAmI application.

## Overview

Sentry is fully integrated into the application to monitor and capture errors across:
- ✅ Server-side API routes
- ✅ Edge runtime (middleware/proxy)
- ✅ Client-side React components
- ✅ Server actions
- ✅ React Error Boundaries

## Configuration Files

### Core Files

1. **`instrumentation.ts`** - Entry point for Sentry initialization
   - Registers Sentry for both Node.js and Edge runtimes
   - Automatically captures request errors

2. **`sentry.server.config.ts`** - Server-side configuration
   - Configured for Node.js runtime
   - Performance monitoring (10% sample rate in production)
   - Node.js profiling enabled

3. **`sentry.edge.config.ts`** - Edge runtime configuration
   - Configured for Edge runtime (middleware/proxy)
   - Lower sample rate for performance (5% in production)

4. **`instrumentation-client.ts`** - Client-side configuration
   - Session Replay enabled (10% of sessions, 100% on errors)
   - User feedback integration

5. **`next.config.ts`** - Next.js configuration
   - Wrapped with `withSentryConfig` for source maps
   - Requires `SENTRY_AUTH_TOKEN` environment variable

## Error Handling

### API Routes

API routes should capture errors to Sentry using the utility function:

```typescript
import { captureError } from '@/lib/utils/sentry';

export async function GET(request: NextRequest) {
  try {
    // Your code here
  } catch (error) {
    captureError(error, {
      tags: { route: '/api/your-route', method: 'GET' },
      extra: { /* additional context */ },
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Server Actions

Server actions should also capture errors:

```typescript
'use server'
import { captureError } from '@/lib/utils/sentry';

export async function myServerAction() {
  try {
    // Your code here
  } catch (error) {
    captureError(error, {
      tags: { action: 'myServerAction' },
    });
    throw error;
  }
}
```

### Client-Side Errors

Client-side errors are automatically captured through:
- React Error Boundary (wraps all components)
- Global error handlers (via ErrorContext)
- Unhandled promise rejections

### Utility Functions

Located in `lib/utils/sentry.ts`:

- **`captureError(error, context?)`** - Capture exceptions
- **`captureMessage(message, level?, context?)`** - Capture non-error messages
- **`addBreadcrumb(message, category?, level?, data?)`** - Add debugging breadcrumbs
- **`setUser(user)`** - Set user context
- **`withTransaction(name, operation, fn)`** - Track performance
- **`withSentry(handler)`** - Wrap API route handlers

## Environment Variables

Required:
- `SENTRY_AUTH_TOKEN` - Auth token for uploading source maps

Optional:
- `ENABLE_SENTRY_DEV` - Set to enable Sentry in development mode (default: disabled)
- `NEXT_PUBLIC_APP_VERSION` - App version for release tracking

## Error Filtering

The following errors are automatically filtered out (noise reduction):
- Browser extension errors
- Expected network failures
- Sentry internal errors

## Performance Monitoring

- **Server**: 10% sample rate in production, 100% in development
- **Edge**: 5% sample rate in production, 100% in development
- **Client**: Configured via Session Replay settings

## Testing Sentry

1. **In Development**: Set `ENABLE_SENTRY_DEV=true` to enable error capture
2. **Test Error Capture**: Use the error test endpoint or trigger an actual error
3. **Check Sentry Dashboard**: Visit your Sentry project to see captured errors

## Current Integration Status

### ✅ Completed
- [x] Sentry SDK installation and configuration
- [x] Server-side error capture (API routes)
- [x] Edge runtime error capture
- [x] Client-side error capture (ErrorBoundary)
- [x] Server actions error capture
- [x] Error utility functions
- [x] Performance monitoring
- [x] Source map upload configuration

### 📝 Recommended Next Steps
- [ ] Add Sentry capture to remaining API routes (use `captureError` helper)
- [ ] Add user context in authenticated routes
- [ ] Set up release tracking with version numbers
- [ ] Configure alerts for critical errors
- [ ] Add custom tags for better error categorization

## Example: Adding Sentry to a New API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/utils/sentry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... your logic
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Capture to Sentry with context
    captureError(error, {
      tags: {
        route: '/api/your-route',
        method: 'POST',
      },
      extra: {
        body: JSON.stringify(body),
      },
    });
    
    // Return error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Monitoring Best Practices

1. **Add Context**: Always include relevant context (route, method, user ID, etc.)
2. **Use Tags**: Use tags for filtering and grouping errors
3. **Breadcrumbs**: Add breadcrumbs for complex flows
4. **User Context**: Set user context in authenticated routes
5. **Performance**: Use transactions for critical operations

## Support

For Sentry-specific issues, refer to:
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/organizations/nexai-5v/projects/whoami/)
