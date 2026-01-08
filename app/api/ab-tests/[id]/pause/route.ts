/**
 * POST /api/ab-tests/[id]/pause - Pause an A/B test
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/serverAuth';
import { handleApiError, successResponse } from '@/lib/utils/apiError';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const auth = await requireAuth(request);
    
    if ('authorized' in auth && !auth.authorized) {
      return handleApiError(new Error(auth.error || 'Unauthorized'), 'POST /api/ab-tests/[id]/pause');
    }

    const userId = 'userId' in auth ? auth.userId : null;
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), 'POST /api/ab-tests/[id]/pause');
    }

    const test = await prisma.aBTestExperiment.findUnique({
      where: { id }
    });

    if (!test || test.userId !== userId) {
      return handleApiError(new Error('Test not found or unauthorized'), 'POST /api/ab-tests/[id]/pause');
    }

    if (test.status !== 'running') {
      return handleApiError(new Error('Test is not running'), 'POST /api/ab-tests/[id]/pause');
    }

    const updated = await prisma.aBTestExperiment.update({
      where: { id },
      data: {
        status: 'paused'
      }
    });

    return successResponse({
      test: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/ab-tests/[id]/pause');
  }
}






