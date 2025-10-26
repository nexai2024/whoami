import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import prisma from '@/lib/prisma';
import { checkUserFeature } from '@/lib/features/checkFeature';

/**
 * PATCH /api/errors/[id]
 * Update an error (mark as resolved, add notes)
 * Auth: Required + error_console_admin feature flag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { resolved, notes } = body;

    // Check if error exists
    const existingError = await prisma.errorLog.findUnique({
      where: { id },
    });

    if (!existingError) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      );
    }

    // Update error
    const updateData: any = {};

    if (typeof resolved === 'boolean') {
      updateData.resolved = resolved;
      if (resolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user.id;
      } else {
        // If marking as unresolved, clear resolution data
        updateData.resolvedAt = null;
        updateData.resolvedBy = null;
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedError = await prisma.errorLog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedError);
  } catch (error) {
    console.error('Error updating error log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
