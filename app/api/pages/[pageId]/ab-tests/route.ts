/**
 * GET /api/pages/[pageId]/ab-tests - Get A/B tests for a page
 * POST /api/pages/[pageId]/ab-tests - Create new A/B test
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tests = await prisma.aBTestExperiment.findMany({
      where: {
        pageId,
        userId
      },
      include: {
        templateA: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        },
        templateB: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      tests: tests.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        startDate: t.startDate?.toISOString(),
        endDate: t.endDate?.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching A/B tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, templateAId, templateBId, trafficSplit } = body;

    if (!name || !templateAId || !templateBId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, templateAId, templateBId' },
        { status: 400 }
      );
    }

    const test = await prisma.aBTestExperiment.create({
      data: {
        pageId,
        userId,
        name,
        description: description || null,
        templateAId,
        templateBId,
        trafficSplit: trafficSplit || 50,
        status: 'draft'
      },
      include: {
        templateA: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        },
        templateB: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      test: {
        ...test,
        createdAt: test.createdAt.toISOString(),
        updatedAt: test.updatedAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating A/B test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






