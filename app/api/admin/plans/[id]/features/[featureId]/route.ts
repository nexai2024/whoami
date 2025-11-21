// app/api/admin/plans/[id]/features/[featureId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// DELETE /api/admin/plans/[id]/features/[featureId] - Remove a feature from a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; featureId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const { id: planId, featureId } = await params;

    await prisma.planFeature.delete({
      where: {
        planId_featureId: {
          planId,
          featureId,
        },
      },
    });

    return NextResponse.json({ message: 'Feature removed from plan successfully' });
  } catch (error) {
    console.error('Error removing feature from plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

