/**
 * Admin utility functions for checking super admin status and plan eligibility
 */

import prisma from '@/lib/prisma';

/**
 * Check if a plan is a super admin plan
 * Super admin plans are identified by:
 * 1. PlanEnum = 'SUPER_ADMIN' (if it exists)
 * 2. Plan name containing "super admin" (case insensitive)
 */
export function isSuperAdminPlan(plan: { planEnum?: string; name?: string }): boolean {
  // Check if planEnum is SUPER_ADMIN
  if (plan.planEnum && plan.planEnum.toUpperCase() === 'SUPER_ADMIN') {
    return true;
  }
  
  // Check if plan name contains "super admin"
  if (plan.name && plan.name.toLowerCase().includes('super admin')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a user is currently a super admin
 * User is a super admin if they have an active subscription to a super admin plan
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });
    // User must have an active subscription
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    // Check if the plan is a super admin plan
    return isSuperAdminPlan(subscription.plan);
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

/**
 * Check if a plan ID corresponds to a super admin plan
 */
export async function isSuperAdminPlanById(planId: string): Promise<boolean> {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return false;
    }

    return isSuperAdminPlan(plan);
  } catch (error) {
    console.error('Error checking super admin plan by ID:', error);
    return false;
  }
}


