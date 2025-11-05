import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * DELETE /api/availability/blackouts/[id]
 * Delete a blackout date
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const blackout = await prisma.blackoutDate.findUnique({
      where: { id },
    });

    if (!blackout) {
      return NextResponse.json(
        { error: 'Blackout date not found' },
        { status: 404 }
      );
    }

    if (blackout.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.blackoutDate.delete({
      where: { id },
    });

    logger.info('Blackout date deleted', { blackoutId: id, userId });

    return NextResponse.json(
      { message: 'Blackout date deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error deleting blackout date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
