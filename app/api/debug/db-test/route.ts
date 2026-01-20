/**
 * GET /api/debug/db-test
 * Simple database connection test endpoint
 * This helps diagnose if Prisma is connecting and if there's data in the database
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test 1: Check if Prisma client is accessible
    const clientCheck = typeof prisma !== 'undefined' && prisma !== null;
    
    // Test 2: Try a simple count query (no filters)
    let totalUsers = 0;
    let totalPages = 0;
    let connectionError = null;
    
    try {
      totalUsers = await prisma.user.count();
      totalPages = await prisma.page.count();
    } catch (error: any) {
      connectionError = {
        message: error.message,
        code: error.code,
        name: error.name
      };
    }

    // Test 3: Try to get first user (if any exists)
    let firstUser = null;
    try {
      firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      });
    } catch (error) {
      // Ignore if this fails
    }

    // Test 4: Check DATABASE_URL (without exposing the full connection string)
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const databaseUrlPreview = hasDatabaseUrl 
      ? `${process.env.DATABASE_URL?.substring(0, 20)}...` 
      : 'NOT SET';

    return NextResponse.json({
      success: true,
      tests: {
        prismaClientAccessible: clientCheck,
        databaseUrlSet: hasDatabaseUrl,
        databaseUrlPreview,
        connectionError,
        counts: {
          totalUsers,
          totalPages
        },
        sampleData: {
          firstUser
        }
      },
      message: connectionError 
        ? 'Database connection failed - check DATABASE_URL and database availability'
        : totalUsers === 0 && totalPages === 0
        ? 'Database connected but appears to be empty'
        : 'Database connected and contains data'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}


