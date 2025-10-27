// app/api/features/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { RateLimitService } from '@/lib/rate-limit'
import { stackServerApp } from '@/stack/server'

// POST /api/features/check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { featureName, incrementUsage = false } = body

    // Get user from Stack auth (middleware ensures user is authenticated)
    const user = await stackServerApp.getUser()
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    if (!featureName) {
      return NextResponse.json(
        { error: 'featureName is required' },
        { status: 400 }
      )
    }

    const result = await RateLimitService.checkFeatureAccess(
      user.id,
      featureName
    )

    if (result.allowed && incrementUsage) {
      await RateLimitService.incrementUsage(user.id, featureName)
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