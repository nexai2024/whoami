/**
 * GET /api/templates/creator/profile - Get template creator profile and stats
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

    // Get or create creator profile
    let profile = await prisma.templateCreatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await prisma.templateCreatorProfile.create({
        data: {
          userId
        }
      });
    }

    // Get user's templates
    const templates = await prisma.pageTemplate.findMany({
      where: { userId },
      select: {
        id: true,
        totalSales: true,
        totalRevenue: true,
        rating: true
      }
    });

    // Calculate stats
    const stats = {
      totalTemplates: templates.length,
      totalSales: templates.reduce((sum, t) => sum + t.totalSales, 0),
      totalRevenue: templates.reduce((sum, t) => sum + Number(t.totalRevenue || 0), 0),
      averageRating: templates.length > 0
        ? templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length
        : 0
    };

    return NextResponse.json({
      profile: {
        ...profile,
        totalRevenue: Number(profile.totalRevenue),
        averageRating: profile.averageRating ? Number(profile.averageRating) : null
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






