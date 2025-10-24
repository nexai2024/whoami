/**
 * GET /api/onboarding - Get user's onboarding progress
 * POST /api/onboarding - Initialize or update onboarding progress
 * PATCH /api/onboarding - Update onboarding progress
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

    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId }
    });

    // If doesn't exist, create it
    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: {
          userId,
          completedSteps: [],
          checklistProgress: {}
        }
      });
    }

    return NextResponse.json({
      userId: onboarding.userId,
      completedSteps: onboarding.completedSteps,
      currentStep: onboarding.currentStep,
      skipped: onboarding.skipped,
      completedAt: onboarding.completedAt?.toISOString() || null,
      tourCompleted: onboarding.tourCompleted,
      checklistProgress: onboarding.checklistProgress,
      createdAt: onboarding.createdAt.toISOString(),
      updatedAt: onboarding.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      completedSteps,
      currentStep,
      skipped,
      tourCompleted,
      checklistProgress,
      complete
    } = body;

    const updateData: any = {};

    if (completedSteps !== undefined) {
      updateData.completedSteps = completedSteps;
    }

    if (currentStep !== undefined) {
      updateData.currentStep = currentStep;
    }

    if (skipped !== undefined) {
      updateData.skipped = skipped;
    }

    if (tourCompleted !== undefined) {
      updateData.tourCompleted = tourCompleted;
    }

    if (checklistProgress !== undefined) {
      updateData.checklistProgress = checklistProgress;
    }

    if (complete) {
      updateData.completedAt = new Date();
    }

    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        completedSteps: completedSteps || [],
        currentStep: currentStep || null,
        skipped: skipped || false,
        tourCompleted: tourCompleted || false,
        checklistProgress: checklistProgress || {}
      }
    });

    return NextResponse.json({
      userId: onboarding.userId,
      completedSteps: onboarding.completedSteps,
      currentStep: onboarding.currentStep,
      skipped: onboarding.skipped,
      completedAt: onboarding.completedAt?.toISOString() || null,
      tourCompleted: onboarding.tourCompleted,
      checklistProgress: onboarding.checklistProgress,
      message: 'Onboarding progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
