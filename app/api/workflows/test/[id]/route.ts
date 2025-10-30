import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Test/Debug Workflow Endpoint
 * POST /api/workflows/[id]/test
 *
 * Executes a workflow in test mode without taking real actions.
 * Useful for debugging workflow logic and step configuration.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
      include: {
        trigger: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Create test execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'RUNNING',
        triggerData: body.testData || {},
        subscriberEmail: body.testData?.email || 'test@example.com',
      },
    });

    // Execute each step in test mode (simulated)
    const stepResults = [];
    let hasErrors = false;

    for (const step of workflow.steps) {
      try {
        const stepStartTime = new Date();

        // Simulate step execution based on type
        let output: any = {
          test: true,
          message: 'Test execution - no real action taken',
          stepType: step.type,
        };

        // Add type-specific test output
        switch (step.type) {
          case 'SEND_EMAIL':
            output.emailDetails = {
              to: body.testData?.email || 'test@example.com',
              subject: step.config?.subject || 'Test Email',
              sent: false,
              testMode: true,
            };
            break;
          case 'WAIT':
            output.delay = {
              amount: step.delayAmount || 0,
              unit: step.delayUnit || 'MINUTES',
              skipped: true,
              reason: 'Test mode skips delays',
            };
            break;
          case 'TAG':
            output.tags = {
              action: step.config?.action || 'add',
              tags: step.config?.tags || [],
              applied: false,
              testMode: true,
            };
            break;
          case 'CONDITION':
            output.condition = {
              evaluated: true,
              result: true, // Always true in test mode
              rules: step.condition || {},
            };
            break;
          default:
            output.config = step.config;
        }

        const stepLog = await prisma.workflowStepLog.create({
          data: {
            executionId: execution.id,
            stepId: step.id,
            status: 'COMPLETED',
            startedAt: stepStartTime,
            completedAt: new Date(),
            input: step.config,
            output,
          },
        });

        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          status: 'COMPLETED',
          duration: Date.now() - stepStartTime.getTime(),
          output,
        });
      } catch (stepError: any) {
        hasErrors = true;

        await prisma.workflowStepLog.create({
          data: {
            executionId: execution.id,
            stepId: step.id,
            status: 'FAILED',
            startedAt: new Date(),
            completedAt: new Date(),
            input: step.config,
            error: stepError.message,
          },
        });

        stepResults.push({
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
          status: 'FAILED',
          error: stepError.message,
        });

        // Stop execution on error
        break;
      }
    }

    // Mark execution complete or failed
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: hasErrors ? 'FAILED' : 'COMPLETED',
        completedAt: new Date(),
        error: hasErrors ? 'One or more steps failed' : null,
      },
    });

    return NextResponse.json({
      success: !hasErrors,
      execution: {
        id: execution.id,
        status: hasErrors ? 'FAILED' : 'COMPLETED',
        workflowName: workflow.name,
        triggerType: workflow.trigger?.triggerType,
        totalSteps: workflow.steps.length,
        stepsExecuted: stepResults.length,
      },
      steps: stepResults,
      testData: body.testData,
      message: hasErrors
        ? 'Test execution completed with errors'
        : 'Test execution completed successfully',
      note: 'This was a test run. No real actions were taken (emails not sent, tags not applied, etc.)',
    });
  } catch (error) {
    console.error('Error testing workflow:', error);
    return NextResponse.json(
      { error: 'Failed to test workflow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
