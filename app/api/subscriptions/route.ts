// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/subscriptions?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const authenticatedUserId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user can only access their own subscription
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

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
    })

    if (!subscription) {
      // Assign free plan to user
      const freePlan = await prisma.plan.findFirst({
        where: {
          planEnum: 'FREE',
          isActive: true
        }
      })

      if (!freePlan) {
        return NextResponse.json(
          { error: 'FREE plan not found in database' },
          { status: 500 }
        )
      }

      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          planId: freePlan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
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
      })

      return NextResponse.json(newSubscription)
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = request.headers.get('x-user-id')
    const body = await request.json()
    const { userId, planId, stripeSubscriptionId, stripeCustomerId } = body

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'userId and planId are required' },
        { status: 400 }
      )
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user can only create subscription for themselves
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId,
        stripeCustomerId,
      },
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
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}