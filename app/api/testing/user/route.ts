import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// POST: Create a new user and their profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      stackAuthUserId,
      email, 
      password, 
      username, 
      displayName, 
      bio, 
      avatar, 
      theme = 'default',
      plan = 'FREE'
    } = body;

    // Validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: email, password, username' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscores only, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores' 
        },
        { status: 400 }
      );
    }

    // Validate plan enum
    const validPlans = ['FREE', 'CREATOR', 'PRO', 'BUSINESS'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid plan. Must be one of: FREE, CREATOR, PRO, BUSINESS' 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use database transaction to ensure both user and profile are created atomically
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Check if email already exists
      const existingUserByEmail = await tx.user.findUnique({
        where: { email }
      });

      if (existingUserByEmail) {
        throw new Error('EMAIL_EXISTS');
      }

      // Check if username already exists
      const existingProfileByUsername = await tx.profile.findUnique({
        where: { username }
      });

      if (existingProfileByUsername) {
        throw new Error('USERNAME_EXISTS');
      }

      // Create user
      const newUser = await tx.user.create({
        data: {
          id: stackAuthUserId,
          email,
          password: hashedPassword,
        }
      });

      // Create profile
      const newProfile = await tx.profile.create({
        data: {
          userId: stackAuthUserId,
          username,
          displayName: displayName || username,
          bio: bio || null,
          avatar: avatar || null,
          theme,
          plan: plan as any, // Cast to PlanEnum
        }
      });

      return { user: newUser, profile: newProfile };
    });

    logger.info('User and profile created successfully:', { 
      userId: stackAuthUserId, 
      email: result.user.email, 
      username: result.profile.username 
    });

    // Return success response (exclude password from response)
    return NextResponse.json(
      {
        success: true,
        message: 'User and profile created successfully',
        data: {
          user: result.user,
          profile: result.profile
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    logger.error('Error creating user and profile:', error);

    // Handle specific error cases
    if (error.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists. Please use a different email address.'
        },
        { status: 409 }
      );
    }

    if (error.message === 'USERNAME_EXISTS') {
      return NextResponse.json(
        {
          success: false,
          error: 'Username already exists. Please choose a different username.'
        },
        { status: 409 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'email') {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already exists. Please use a different email address.'
          },
          { status: 409 }
        );
      }
      if (field === 'username') {
        return NextResponse.json(
          {
            success: false,
            error: 'Username already exists. Please choose a different username.'
          },
          { status: 409 }
        );
      }
    }

    // Handle other database errors
    if (error?.code?.startsWith('P')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error occurred. Please try again.'
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user and profile. Please try again.'
      },
      { status: 500 }
    );
  }
}

// GET: Get user and profile information (for testing purposes)
export async function GET(req: NextRequest) {
  try {
    // For testing purposes, you might want to get user by ID from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId query parameter is required' 
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });


    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            ...userWithoutPassword,
            createdAt: userWithoutPassword.createdAt.toISOString(),
            updatedAt: userWithoutPassword.updatedAt.toISOString()
          }
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    logger.error('Error fetching user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user information.'
      },
      { status: 500 }
    );
  }
}
