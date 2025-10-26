import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get workflow with executions
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        executions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            completedAt: true
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

    const totalRuns = workflow.executions.length;
    const successfulRuns = workflow.executions.filter(e => e.status === 'COMPLETED').length;
    const failedRuns = workflow.executions.filter(e => e.status === 'FAILED').length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    // Get last run timestamp
    const lastRun = workflow.executions.length > 0
      ? workflow.executions.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null;

    return NextResponse.json({
      workflowName: workflow.name,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate,
      lastRunAt: lastRun?.createdAt || null
    });
  } catch (error) {
    console.error('Error fetching workflow analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
