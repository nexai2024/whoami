import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const [totals, recent] = await Promise.all([
      prisma.creatorEarning.groupBy({
        by: ['currency', 'status'],
        where: { userId },
        _sum: {
          grossAmount: true,
          stripeFees: true,
          applicationFees: true,
          netAmount: true,
        },
      }),
      prisma.creatorEarning.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
    ]);

    return NextResponse.json({
      totals,
      recent,
    });
  } catch (error) {
    console.error('Fetch earnings error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}









