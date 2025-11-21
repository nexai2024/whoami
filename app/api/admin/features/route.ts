// app/api/admin/features/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { isSuperAdmin } from '@/lib/utils/adminUtils';

// GET /api/admin/features - List all features
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const features = await prisma.feature.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/features - Create a new feature
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsSuperAdmin = await isSuperAdmin(user.id);
    if (!userIsSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const feature = await prisma.feature.create({
      data: {
        name,
        description: description || null,
        type: type || 'quota',
      },
    });

    return NextResponse.json(feature);
  } catch (error: any) {
    console.error('Error creating feature:', error);
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

