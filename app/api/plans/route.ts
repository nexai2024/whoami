// app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { stackServerApp } from '@/stack/server'
import { isSuperAdmin, isSuperAdminPlan } from '@/lib/utils/adminUtils'

// GET /api/plans
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user if available
    let userIsSuperAdmin = false;
    try {
      const user = await stackServerApp.getUser();
      if (user?.id) {
        userIsSuperAdmin = await isSuperAdmin(user.id);
      }
    } catch (error) {
      // User not authenticated, which is fine - they'll just see public plans
      console.log('No authenticated user for plans request');
    }

    // Fetch all active plans
    const allPlans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
      orderBy: [
        {
          // Order by planEnum tier: FREE (0), CREATOR (1), PRO (2), BUSINESS (3), SUPER_ADMIN (if exists)
          planEnum: 'asc'
        }
      ],
    })

    // Filter out super admin plans if user is not a super admin
    const filteredPlans = allPlans.filter((plan: any) => {
      const planIsSuperAdmin = isSuperAdminPlan(plan);
      // Show plan if: (1) it's not a super admin plan, OR (2) user is a super admin
      return !planIsSuperAdmin || userIsSuperAdmin;
    });

    return NextResponse.json(filteredPlans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}