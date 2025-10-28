import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const headerData = await req.json();
  
  try {
    console.log("Header data received for update:", headerData);
    
    // Step 1: Validate page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, userId: true }
    });
    
    if (!page) {
      console.log('Page not found:', pageId);
      return NextResponse.json(
        { error: 'Page not found' }, 
        { status: 404 }
      );
    }
    
    // TODO: Add authorization check when auth is implemented
    // Verify currentUser.id === page.userId
    // Return 403 if user doesn't own the page
    
    // Step 2: Validate header data structure
    if (!headerData || typeof headerData !== 'object' || Array.isArray(headerData)) {
      console.log('Invalid headerData:', headerData);
      return NextResponse.json(
        { error: 'Invalid header data structure' },
        { status: 400 }
      );
    }
    
    // Validate headerStyle enum
    const validHeaderStyles = ['minimal', 'card', 'gradient', 'split'];
    if (headerData.headerStyle && !validHeaderStyles.includes(headerData.headerStyle)) {
      console.log('Invalid headerStyle:', headerData.headerStyle);
      return NextResponse.json(
        { error: 'Invalid headerStyle. Must be: minimal, card, gradient, or split' },
        { status: 400 }
      );
    }
    
    // Validate string length limits
    const stringLimits: Record<string, number> = {
      displayName: 100,
      title: 100,
      company: 100,
      bio: 2500,
      phone: 50,
      location: 100,
      customIntroduction: 1000
    };
    
    for (const [field, maxLength] of Object.entries(stringLimits)) {
      if (headerData[field] && headerData[field].length > maxLength) {
        console.log('Field exceeds maximum length:', field, headerData[field], maxLength);
        return NextResponse.json(
          { error: `${field} exceeds maximum length of ${maxLength} characters` },
          { status: 400 }
        );
      }
    }
    
    // Validate email format (if provided)
    if (headerData.email && headerData.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(headerData.email)) {
        console.log('Invalid email format:', headerData.email);
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }
    
    // Validate URL formats (if provided)
    const urlFields = ['website', 'avatar', 'backgroundImage'];
    for (const field of urlFields) {
      if (headerData[field] && headerData[field].length > 0) {
        try {
          new URL(headerData[field]);
        } catch {
          console.log('Invalid URL format:', field, headerData[field]);
          return NextResponse.json(
            { error: `Invalid ${field} URL format` },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate socialLinks structure
    if (headerData.socialLinks && typeof headerData.socialLinks === 'object') {
      const validPlatforms = ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'github', 'youtube', 'custom'];
      for (const [platform, url] of Object.entries(headerData.socialLinks)) {
        if (!validPlatforms.includes(platform)) {
          console.log('Invalid social platform:', platform);
          return NextResponse.json(
            { error: `Invalid social platform: ${platform}` },
            { status: 400 }
          );
        }
        // URLs can be empty strings, but if provided must be valid
        if (url && typeof url === 'string' && url.length > 0) {
          try {
            new URL(url);
          } catch {
            console.log('Invalid URL for social platform:', platform, url);
            // return NextResponse.json(
            //   { error: `Invalid URL for social platform: ${platform}` },
            //   { status: 400 }
            // );
          }
        }
      }
    }
    
    // Validate boolean fields
    const booleanFields = ['showContactInfo', 'showSocialLinks', 'showLocation'];
    for (const field of booleanFields) {
      if (headerData[field] !== undefined && typeof headerData[field] !== 'boolean') {
        console.log('Invalid boolean field:', field, headerData[field]);
        return NextResponse.json(
          { error: `${field} must be a boolean` },
          { status: 400 }
        );
      }
    }
    
    // Step 3: Upsert page header (create or update)
    const updatedPageHeader = await prisma.pageHeader.upsert({
      where: {
        pageId: pageId
      },
      update: {
        data: headerData,
        updatedAt: new Date()
      },
      create: {
        pageId: pageId,
        data: headerData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    logger.info(`Page header saved successfully for page ${pageId}`);
    return NextResponse.json({ updatedPageHeader }, { status: 200 });
  } catch (error) {
    logger.error('Error saving page header:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to save page header: ${errorMessage}` },
      { status: 500 }
    );
  }
}