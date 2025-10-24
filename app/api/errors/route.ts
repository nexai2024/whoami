import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import prisma from '@/lib/prisma';
import { checkUserFeature } from '@/lib/features/checkFeature';

/**
 * POST /api/errors
 * Persist a client-side error to the database
 * Auth: Optional (errors can occur before auth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      stack,
      errorType,
      url,
      pathname,
      userAgent,
      componentStack,
      context,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to get authenticated user (may be null for unauthenticated errors)
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userPlan: string | null = null;

    try {
      const user = await stackServerApp.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.primaryEmail || null;

        // Get user's plan from profile
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { plan: true },
        });
        userPlan = profile?.plan || null;
      }
    } catch (authError) {
      // User not authenticated - this is fine, we still log the error
      console.log('Error occurred for unauthenticated user');
    }

    // Create error log entry
    await prisma.errorLog.create({
      data: {
        userId,
        message,
        stack: stack || null,
        errorType: errorType || 'runtime',
        url: url || null,
        pathname: pathname || null,
        userAgent: userAgent || null,
        componentStack: componentStack || null,
        userEmail,
        userPlan,
        context: context || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Don't create error loop - just log to console
    console.error('Failed to persist error:', error);
    // Return 200 anyway to prevent client-side error loop
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * GET /api/errors
 * Fetch historical errors for admin viewing
 * Auth: Required + error_console_admin feature flag
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin feature access
    const hasAccess = await checkUserFeature(user.id, 'error_console_admin');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '24h';
    const errorType = searchParams.get('errorType') || 'all';
    const resolved = searchParams.get('resolved') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Build date filter
    const now = new Date();
    let dateFilter: Date | undefined;
    switch (dateRange) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateFilter = undefined;
    }

    // Build where clause
    const where: any = {};

    if (dateFilter) {
      where.timestamp = { gte: dateFilter };
    }

    if (errorType !== 'all') {
      where.errorType = errorType;
    }

    if (resolved !== 'all') {
      where.resolved = resolved === 'true';
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.errorLog.count({ where });

    // Get paginated errors
    const errors = await prisma.errorLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      errors,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
