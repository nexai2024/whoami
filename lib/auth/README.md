# Centralized Authorization, Feature Gating, and Rate Limiting

This directory contains centralized authorization, feature gating, and rate limiting logic for the application.

## Overview

All user-specific logic has been centralized into:
- **UserContext** - Client-side context for authorization, features, and rate limiting
- **serverAuth.ts** - Server-side utilities for API routes
- **Hooks** - Convenient React hooks for common patterns

## Client-Side Usage

### UserContext

The `UserContext` provides centralized access to:
- Authentication state
- Feature access checking (with caching)
- Rate limiting checks
- Subscription and plan information
- Authorization helpers

```tsx
import { useUserContext } from '@/lib/contexts/UserContext';

function MyComponent() {
  const {
    isAuthenticated,
    userId,
    checkFeature,
    hasFeature,
    subscription,
    isAdmin,
    canAccess,
    isOwner
  } = useUserContext();

  // Check feature access
  const canUseFeature = await hasFeature('ai_generations');
  
  // Check with full details
  const featureResult = await checkFeature('pages', false);
  
  // Authorization checks
  if (canAccess(resourceUserId)) {
    // User can access this resource
  }
}
```

### Authorization Hook

Simplified hook for common authorization patterns:

```tsx
import { useAuthorization } from '@/lib/hooks/useAuthorization';

function MyComponent() {
  const {
    userId,
    isAuthenticated,
    isAdmin,
    canAccessResource,
    ownsResource,
    hasFeatureAccess,
    subscription,
    planName,
    isOnPlan,
    hasActiveSubscription
  } = useAuthorization();

  // Check if user owns a resource
  if (ownsResource(resourceUserId)) {
    // Show edit button
  }
  
  // Check feature access
  const canUseAI = await hasFeatureAccess('ai_generations');
  
  // Check plan
  if (isOnPlan('PRO')) {
    // Show pro features
  }
}
```

### Feature Gate Hook

For conditional rendering based on feature access:

```tsx
import { useFeatureGate } from '@/lib/hooks/useFeatureGate';

function MyComponent() {
  const { hasAccess, limit, remaining, loading } = useFeatureGate('pages');
  
  if (loading) return <div>Loading...</div>;
  
  if (!hasAccess) {
    return <div>Upgrade to use this feature</div>;
  }
  
  return (
    <div>
      You have {remaining} of {limit} pages remaining
    </div>
  );
}
```

## Server-Side Usage

### API Route Authorization

Use the server-side utilities in API routes:

```ts
import { requireAuth, requireOwnership, requireFeature } from '@/lib/auth/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

// Require authentication
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }
  
  const { userId } = auth;
  // Use userId...
}

// Require ownership
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Get resource to check ownership
  const resource = await prisma.page.findUnique({ where: { id } });
  if (!resource) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const auth = await requireOwnership(request, resource.userId);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }
  
  // User owns the resource, proceed...
}

// Require feature access
export async function POST(request: NextRequest) {
  const auth = await requireFeature(request, 'ai_generations');
  
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }
  
  // User has feature access, proceed...
  // Optionally increment usage
  await RateLimitService.incrementUsage(auth.userId!, 'ai_generations');
}
```

### Available Server Functions

- `getAuthenticatedUser(request)` - Get authenticated user (returns null if not authenticated)
- `requireAuth(request)` - Require authentication (returns error if not)
- `requireOwnership(request, resourceUserId)` - Require user owns resource
- `requireAccess(request, resourceUserId)` - Require user owns resource OR is admin
- `requireFeature(request, featureName)` - Require user has feature access
- `checkUserFeature(userId, featureName)` - Check if user has feature (boolean)
- `checkFeatureAccess(userId, featureName)` - Check feature with full result
- `checkResourceOwnership(resourceId, userId, model)` - Check ownership in database
- `requireResourceOwnership(request, resourceId, model)` - Require ownership (checks DB)
- `getUserSubscription(userId)` - Get user's subscription

## Migration Guide

### Replacing Direct Feature Checks

**Before:**
```tsx
import { checkUserFeature } from '@/lib/features/checkFeature';

const isAdmin = await checkUserFeature(userId, 'error_console_admin');
```

**After:**
```tsx
import { useUserContext } from '@/lib/contexts/UserContext';

const { hasFeature, isAdmin } = useUserContext();
const isAdmin = await hasFeature('error_console_admin');
// Or use the cached isAdmin value directly
```

### Replacing API Route Auth Checks

**Before:**
```ts
const userId = request.headers.get('x-user-id');
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const page = await prisma.page.findUnique({ where: { id } });
if (page.userId !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**After:**
```ts
import { requireResourceOwnership } from '@/lib/auth/serverAuth';

const auth = await requireResourceOwnership(request, pageId, 'page');
if (!auth.authorized) {
  return NextResponse.json(
    { error: auth.error },
    { status: auth.statusCode }
  );
}
```

## Benefits

1. **Centralized Logic** - All authorization, feature gating, and rate limiting in one place
2. **Caching** - Feature checks are cached client-side to reduce API calls
3. **Type Safety** - Full TypeScript support
4. **Consistency** - Same patterns across the entire application
5. **Maintainability** - Easy to update authorization logic in one place
6. **Performance** - Reduced redundant checks and API calls

