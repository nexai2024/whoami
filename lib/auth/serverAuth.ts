import { NextRequest } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { RateLimitService, RateLimitResult } from '@/lib/rate-limit';
import prisma from '@/lib/prisma';

/**
 * Server-side authorization utilities for API routes
 * Centralizes all authorization, feature gating, and rate limiting logic
 */

export interface AuthResult {
  userId: string;
  user: any;
}

export interface AuthorizationResult {
  authorized: boolean;
  userId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Get authenticated user from request
 * Uses Stack auth via middleware-set header or direct check
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthResult | null> {
  try {
    // First try to get from header (set by middleware)
    const userIdFromHeader = request.headers.get('x-user-id');
    
    if (userIdFromHeader) {
      const user = await stackServerApp.getUser();
      if (user?.id === userIdFromHeader) {
        return {
          userId: user.id,
          user
        };
      }
    }
    
    // Fallback: try to get user directly
    const user = await stackServerApp.getUser();
    if (user?.id) {
      return {
        userId: user.id,
        user
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | AuthorizationResult> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return {
      authorized: false,
      error: 'Unauthorized',
      statusCode: 401
    };
  }
  
  return auth;
}

/**
 * Check if user owns a resource
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthorizationResult> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return {
      authorized: false,
      error: 'Unauthorized',
      statusCode: 401
    };
  }
  
  if (auth.userId !== resourceUserId) {
    return {
      authorized: false,
      error: 'Forbidden - you can only access your own resources',
      statusCode: 403
    };
  }
  
  return {
    authorized: true,
    userId: auth.userId
  };
}

/**
 * Check if user can access a resource (owner or admin)
 */
export async function requireAccess(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthorizationResult> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return {
      authorized: false,
      error: 'Unauthorized',
      statusCode: 401
    };
  }
  
  // Check if user is admin
  const isAdmin = await checkUserFeature(auth.userId, 'error_console_admin');
  
  if (auth.userId === resourceUserId || isAdmin) {
    return {
      authorized: true,
      userId: auth.userId
    };
  }
  
  return {
    authorized: false,
    error: 'Forbidden',
    statusCode: 403
  };
}

/**
 * Check if user has access to a feature
 */
export async function checkUserFeature(
  userId: string,
  featureName: string
): Promise<boolean> {
  try {
    const result = await RateLimitService.checkFeatureAccess(userId, featureName);
    return result.allowed || false;
  } catch (error) {
    console.error('Error checking user feature:', error);
    return false;
  }
}

/**
 * Check feature access with full result
 */
export async function checkFeatureAccess(
  userId: string,
  featureName: string
): Promise<RateLimitResult> {
  return RateLimitService.checkFeatureAccess(userId, featureName);
}

/**
 * Require feature access - returns error if user doesn't have feature
 */
export async function requireFeature(
  request: NextRequest,
  featureName: string
): Promise<AuthorizationResult & { featureResult?: RateLimitResult }> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return {
      authorized: false,
      error: 'Unauthorized',
      statusCode: 401
    };
  }
  
  const featureResult = await RateLimitService.checkFeatureAccess(
    auth.userId,
    featureName
  );
  
  if (!featureResult.allowed) {
    return {
      authorized: false,
      error: featureResult.message || 'Feature not available',
      statusCode: 403,
      featureResult
    };
  }
  
  return {
    authorized: true,
    userId: auth.userId,
    featureResult
  };
}

/**
 * Check resource ownership in database
 */
export async function checkResourceOwnership(
  resourceId: string,
  userId: string,
  model: 'page' | 'product' | 'course' | 'funnel' | 'leadMagnet' | 'workflow' | 'campaign'
): Promise<boolean> {
  try {
    const modelMap = {
      page: prisma.page,
      product: prisma.product,
      course: prisma.course,
      funnel: prisma.funnel,
      leadMagnet: prisma.leadMagnet,
      workflow: prisma.workflow,
      campaign: prisma.campaign,
    };
    
    const dbModel = modelMap[model];
    if (!dbModel) {
      return false;
    }
    
    const resource = await (dbModel as any).findUnique({
      where: { id: resourceId },
      select: { userId: true }
    });
    
    return resource?.userId === userId;
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
}

/**
 * Require resource ownership - checks in database
 */
export async function requireResourceOwnership(
  request: NextRequest,
  resourceId: string,
  model: 'page' | 'product' | 'course' | 'funnel' | 'leadMagnet' | 'workflow' | 'campaign'
): Promise<AuthorizationResult> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return {
      authorized: false,
      error: 'Unauthorized',
      statusCode: 401
    };
  }
  
  const isOwner = await checkResourceOwnership(resourceId, auth.userId, model);
  
  if (!isOwner) {
    return {
      authorized: false,
      error: 'Forbidden - you can only access your own resources',
      statusCode: 403
    };
  }
  
  return {
    authorized: true,
    userId: auth.userId
  };
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });
    
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

