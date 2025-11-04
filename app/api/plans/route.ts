// app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/plans
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
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
          // Order by planEnum tier: FREE (0), CREATOR (1), PRO (2), BUSINESS (3)
          planEnum: 'asc'
        }
      ],
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}