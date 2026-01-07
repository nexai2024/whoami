/**
 * POST /api/ab-tests/[id]/start - Start an A/B test
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const test = await prisma.aBTestExperiment.findUnique({
      where: { id }
    });

    if (!test || test.userId !== userId) {
      return NextResponse.json(
        { error: 'Test not found or unauthorized' },
        { status: 404 }
      );
    }

    if (test.status !== 'draft' && test.status !== 'paused') {
      return NextResponse.json(
        { error: 'Test cannot be started in current state' },
        { status: 400 }
      );
    }

    const updated = await prisma.aBTestExperiment.update({
      where: { id },
      data: {
        status: 'running',
        startDate: test.startDate || new Date()
      }
    });

    return NextResponse.json({
      test: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        startDate: updated.startDate?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error starting A/B test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






