// app/api/features/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RateLimitService } from '@/lib/rate-limit'

// POST /api/features/check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, featureName, incrementUsage = false } = body

    if (!userId || !featureName) {
      return NextResponse.json(
        { error: 'userId and featureName are required' },
        { status: 400 }
      )
    }

    const result = await RateLimitService.checkFeatureAccess(
      userId,
      featureName
    )

    if (result.allowed && incrementUsage) {
      await RateLimitService.incrementUsage(userId, featureName)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking feature access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}