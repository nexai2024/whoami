import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/availability/windows/[id]
 * Get a specific availability window
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    const window = await prisma.availabilityWindow.findUnique({
      where: { id },
    });

    if (!window) {
      return NextResponse.json(
        { error: 'Availability window not found' },
        { status: 404 }
      );
    }

    // Verify ownership (optional check - can be public if userId not provided)
    if (userId && window.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ window });
  } catch (error) {
    logger.error('Error fetching availability window:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/availability/windows/[id]
 * Update an availability window
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingWindow = await prisma.availabilityWindow.findUnique({
      where: { id },
    });

    if (!existingWindow) {
      return NextResponse.json(
        { error: 'Availability window not found' },
        { status: 404 }
      );
    }

    if (existingWindow.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate time format if provided
    if (body.startTime || body.endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      const startTime = body.startTime || existingWindow.startTime;
      const endTime = body.endTime || existingWindow.endTime;

      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return NextResponse.json(
          { error: 'Invalid time format. Use HH:MM (24-hour format)' },
          { status: 400 }
        );
      }

      // Validate start time is before end time
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        return NextResponse.json(
          { error: 'endTime must be after startTime' },
          { status: 400 }
        );
      }

      // Check for overlaps (excluding current window)
      if (body.startTime || body.endTime) {
        const overlaps = await prisma.availabilityWindow.findMany({
          where: {
            userId,
            dayOfWeek: body.dayOfWeek !== undefined ? body.dayOfWeek : existingWindow.dayOfWeek,
            id: { not: id },
            isActive: true,
            OR: [
              {
                AND: [
                  { startTime: { lte: endTime } },
                  { endTime: { gte: startTime } },
                ],
              },
            ],
          },
        });

        if (overlaps.length > 0) {
          return NextResponse.json(
            { error: 'Availability window overlaps with existing window' },
            { status: 409 }
          );
        }
      }
    }

    // Validate dayOfWeek if provided
    if (body.dayOfWeek !== undefined) {
      if (body.dayOfWeek < 0 || body.dayOfWeek > 6) {
        return NextResponse.json(
          { error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (body.dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(body.dayOfWeek);
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const window = await prisma.availabilityWindow.update({
      where: { id },
      data: updateData,
    });

    logger.info('Availability window updated', { windowId: id, userId });

    return NextResponse.json({ window });
  } catch (error) {
    logger.error('Error updating availability window:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/windows/[id]
 * Delete an availability window
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
    const window = await prisma.availabilityWindow.findUnique({
      where: { id },
    });

    if (!window) {
      return NextResponse.json(
        { error: 'Availability window not found' },
        { status: 404 }
      );
    }

    if (window.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.availabilityWindow.delete({
      where: { id },
    });

    logger.info('Availability window deleted', { windowId: id, userId });

    return NextResponse.json(
      { message: 'Availability window deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error deleting availability window:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
