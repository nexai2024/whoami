// app/api/admin/features/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// GET /api/admin/features/[id] - Get a single feature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        planFeatures: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error fetching feature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/features/[id] - Update a feature
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, type } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;

    const feature = await prisma.feature.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(feature);
  } catch (error: any) {
    console.error('Error updating feature:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Feature with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/features/[id] - Delete a feature
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    await prisma.feature.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

