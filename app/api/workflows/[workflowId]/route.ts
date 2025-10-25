/**
 * GET /api/workflows/[workflowId] - Get workflow details
 * PUT /api/workflows/[workflowId] - Update workflow
 * DELETE /api/workflows/[workflowId] - Delete workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        trigger: true,
        steps: {
          orderBy: { order: 'asc' }
        },
        executions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            stepLogs: {
              include: {
                step: {
                  select: {
                    name: true,
                    type: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (workflow.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, canvasData, status, enabled } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (canvasData !== undefined) updateData.canvasData = canvasData;
    if (status !== undefined) updateData.status = status;
    if (enabled !== undefined) updateData.enabled = enabled;

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        trigger: true,
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await prisma.workflow.delete({
      where: { id: workflowId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
