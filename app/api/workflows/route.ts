/**
 * GET /api/workflows - List workflows
 * POST /api/workflows - Create workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const enabled = searchParams.get('enabled');

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (enabled !== null) {
      where.enabled = enabled === 'true';
    }

    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        trigger: true,
        steps: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            executions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, canvasData } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name,
        description,
        canvasData: canvasData || {},
        status: 'DRAFT',
        enabled: false
      }
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
