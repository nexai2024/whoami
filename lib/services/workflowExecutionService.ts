/**
 * Workflow Execution Service
 * Handles the execution of automation workflows
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WorkflowExecutionService {
  /**
   * Trigger a workflow based on an event
   */
  static async triggerWorkflows(
    triggerType: string,
    triggerData: any
  ): Promise<void> {
    try {
      // Find all active workflows with this trigger type
      const workflows = await prisma.workflow.findMany({
        where: {
          enabled: true,
          status: 'ACTIVE',
          trigger: {
            triggerType: triggerType as any
          }
        },
        include: {
          trigger: true,
          steps: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Execute each workflow
      for (const workflow of workflows) {
        // Check if trigger filters match
        if (this.matchesTriggerFilters(workflow.trigger?.filters, triggerData)) {
          await this.executeWorkflow(workflow.id, triggerData);
        }
      }
    } catch (error) {
      console.error('Error triggering workflows:', error);
    }
  }

  /**
   * Execute a specific workflow
   */
  static async executeWorkflow(
    workflowId: string,
    triggerData: any
  ): Promise<string> {
    try {
      // Create execution record
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId,
          status: 'RUNNING',
          triggerData,
          subscriberEmail: triggerData.email || null
        }
      });

      // Execute in background (don't await)
      this.runWorkflowSteps(execution.id).catch(error => {
        console.error(`Workflow execution ${execution.id} failed:`, error);
        prisma.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: 'FAILED',
            error: error.message,
            completedAt: new Date()
          }
        });
      });

      return execution.id;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  /**
   * Run all steps in a workflow execution
   */
  private static async runWorkflowSteps(executionId: string): Promise<void> {
    try {
      const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: {
          workflow: {
            include: {
              steps: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!execution) {
        throw new Error('Execution not found');
      }

      // Execute steps in order
      for (const step of execution.workflow.steps) {
        await this.executeStep(executionId, step.id, execution.triggerData);
      }

      // Mark as completed
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Update workflow stats
      await prisma.workflow.update({
        where: { id: execution.workflowId },
        data: {
          totalRuns: { increment: 1 },
          successfulRuns: { increment: 1 },
          lastRunAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error running workflow steps:', error);
      throw error;
    }
  }

  /**
   * Execute a single workflow step
   */
  private static async executeStep(
    executionId: string,
    stepId: string,
    context: any
  ): Promise<void> {
    try {
      const step = await prisma.workflowStep.findUnique({
        where: { id: stepId }
      });

      if (!step) {
        throw new Error('Step not found');
      }

      // Create step log
      const stepLog = await prisma.workflowStepLog.create({
        data: {
          executionId,
          stepId,
          status: 'RUNNING',
          startedAt: new Date(),
          input: context
        }
      });

      // Handle delay
      if (step.delayAmount && step.delayUnit) {
        const delayMs = this.calculateDelay(step.delayAmount, step.delayUnit);
        await this.delay(delayMs);
      }

      // Execute step based on type
      let output: any = {};

      switch (step.type) {
        case 'SEND_EMAIL':
          output = await this.executeSendEmail(step, context);
          break;

        case 'ADD_TAG':
          output = await this.executeAddTag(step, context);
          break;

        case 'REMOVE_TAG':
          output = await this.executeRemoveTag(step, context);
          break;

        case 'ENROLL_IN_COURSE':
          output = await this.executeEnrollInCourse(step, context);
          break;

        case 'WAIT':
        case 'DELAY':
          output = { delayed: true };
          break;

        case 'CONDITION':
          output = await this.evaluateCondition(step, context);
          break;

        default:
          output = { message: `Step type ${step.type} not implemented yet` };
      }

      // Update step log
      await prisma.workflowStepLog.update({
        where: { id: stepLog.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          output
        }
      });
    } catch (error: any) {
      console.error(`Error executing step ${stepId}:`, error);

      await prisma.workflowStepLog.updateMany({
        where: {
          executionId,
          stepId
        },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });

      throw error;
    }
  }

  /**
   * Execute SEND_EMAIL action
   */
  private static async executeSendEmail(step: any, context: any): Promise<any> {
    const config = step.config as any;
    const email = context.email || config.to;

    if (!email) {
      throw new Error('No email recipient found');
    }

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`Sending email to ${email}:`, {
      subject: config.subject,
      body: config.body
    });

    return {
      sent: true,
      to: email,
      subject: config.subject
    };
  }

  /**
   * Execute ADD_TAG action
   */
  private static async executeAddTag(step: any, context: any): Promise<any> {
    const config = step.config as any;
    const email = context.email;
    const tag = config.tag;

    if (!email || !tag) {
      throw new Error('Email and tag required');
    }

    // Find subscriber and add tag
    await prisma.emailSubscriber.updateMany({
      where: { email },
      data: {
        tags: {
          push: tag
        }
      }
    });

    return {
      email,
      tagAdded: tag
    };
  }

  /**
   * Execute REMOVE_TAG action
   */
  private static async executeRemoveTag(step: any, context: any): Promise<any> {
    const config = step.config as any;
    const email = context.email;
    const tag = config.tag;

    if (!email || !tag) {
      throw new Error('Email and tag required');
    }

    // Find subscriber and remove tag
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email }
    });

    if (subscriber) {
      const updatedTags = subscriber.tags.filter((t: string) => t !== tag);
      await prisma.emailSubscriber.update({
        where: { id: subscriber.id },
        data: { tags: updatedTags }
      });
    }

    return {
      email,
      tagRemoved: tag
    };
  }

  /**
   * Execute ENROLL_IN_COURSE action
   */
  private static async executeEnrollInCourse(step: any, context: any): Promise<any> {
    const config = step.config as any;
    const email = context.email;
    const courseId = config.courseId;

    if (!email || !courseId) {
      throw new Error('Email and courseId required');
    }

    // Enroll user in course
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        courseId_email: {
          courseId,
          email
        }
      },
      create: {
        courseId,
        email,
        name: context.name || null,
        enrollmentSource: 'workflow'
      },
      update: {}
    });

    return {
      email,
      courseId,
      enrollmentId: enrollment.id
    };
  }

  /**
   * Evaluate a condition
   */
  private static async evaluateCondition(step: any, context: any): Promise<any> {
    const config = step.config as any;
    const condition = config.condition;

    // Simple condition evaluation
    // TODO: Implement more complex condition logic
    const result = this.evaluateExpression(condition, context);

    return {
      conditionMet: result,
      condition
    };
  }

  /**
   * Simple expression evaluator
   */
  private static evaluateExpression(expression: string, context: any): boolean {
    try {
      // Very basic evaluation - expand this for production
      // Example: "email contains '@gmail.com'"
      const parts = expression.split(' ');

      if (parts.length === 3) {
        const [field, operator, value] = parts;
        const fieldValue = context[field];

        switch (operator) {
          case 'equals':
            return fieldValue === value;
          case 'contains':
            return String(fieldValue).includes(value);
          case 'exists':
            return fieldValue !== undefined && fieldValue !== null;
          default:
            return false;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if trigger filters match
   */
  private static matchesTriggerFilters(filters: any, data: any): boolean {
    if (!filters) return true;

    // TODO: Implement filter matching logic
    return true;
  }

  /**
   * Calculate delay in milliseconds
   */
  private static calculateDelay(amount: number, unit: string): number {
    switch (unit) {
      case 'MINUTES':
        return amount * 60 * 1000;
      case 'HOURS':
        return amount * 60 * 60 * 1000;
      case 'DAYS':
        return amount * 24 * 60 * 60 * 1000;
      case 'WEEKS':
        return amount * 7 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export helper function to trigger workflows from anywhere
export async function triggerWorkflow(triggerType: string, data: any): Promise<void> {
  await WorkflowExecutionService.triggerWorkflows(triggerType, data);
}
