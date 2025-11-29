/**
 * POST /api/lead-magnets - Create new lead magnet
 * GET /api/lead-magnets - List all lead magnets for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MagnetType, DeliveryMethod, MagnetStatus } from '@prisma/client';
import { requireAuth, requireFeature } from '@/lib/auth/serverAuth';
import { RateLimitService } from '@/lib/rate-limit';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

type CreationMethod = 'UPLOAD' | 'TEMPLATE' | 'AI_GENERATE';

/**
 * Generate a unique slug from the lead magnet name
 */
async function generateUniqueSlug(name: string, existingId?: string): Promise<string> {
  // Convert to lowercase and replace spaces with hyphens
  let slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')                    // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')              // Remove all chars except a-z, 0-9, hyphens
    .replace(/-+/g, '-')                     // Replace duplicate hyphens with single hyphen
    .replace(/^-|-$/g, '')                   // Trim hyphens from start/end
    .substring(0, 100);                      // Max length 100 chars

  // Check for uniqueness
  const existing = await prisma.leadMagnet.findUnique({
    where: { slug },
  });

  // If slug exists and it's not the same lead magnet, append a number
  if (existing && existing.id !== existingId) {
    let counter = 2;
    let newSlug = `${slug}-${counter}`;

    while (true) {
      const existingWithNumber = await prisma.leadMagnet.findUnique({
        where: { slug: newSlug },
      });

      if (!existingWithNumber || existingWithNumber.id === existingId) {
        break;
      }

      counter++;
      newSlug = `${slug}-${counter}`;
    }

    slug = newSlug;
  }

  return slug;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Require authentication and check feature access (lead_magnets quota)
    // Why: We use requireFeature() which combines auth check + rate limiting in one call
    // This ensures the user is authenticated AND has remaining quota
    const auth = await requireFeature(request, 'lead_magnets');
    
    if (!auth.authorized) {
      // Return detailed error with limit information
      return NextResponse.json(
        {
          error: auth.error || 'Lead magnet limit reached for your plan',
          limit: auth.featureResult?.limit,
          remaining: auth.featureResult?.remaining ?? 0,
          resetAt: auth.featureResult?.resetAt?.toISOString()
        },
        { status: auth.statusCode || 403 }
      );
    }

    // Step 2: Extract userId from auth result
    // Why: The auth object contains the authenticated user's ID
    const userId = auth.userId!;
    logger.info("Creating lead magnet for user:", userId);

    const body = await request.json();
    const {
      name,
      description,
      type,
      creationMethod,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      templateId,
      aiPrompt,
      headline,
      subheadline,
      benefits = [],
      deliveryMethod = DeliveryMethod.INSTANT_DOWNLOAD,
      deliveryDelay = 0,
      coverImageUrl,
      brandColors,
    } = body;

    // Validate required fields
    if (!name || !type || !creationMethod || !headline) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, creationMethod, headline' },
        { status: 400 }
      );
    }

    // Handle different creation methods
    let leadMagnetData: any = {
      userId,
      name,
      description,
      type: type as MagnetType,
      headline,
      subheadline,
      benefits,
      deliveryMethod: deliveryMethod as DeliveryMethod,
      deliveryDelay,
      coverImageUrl,
      brandColors,
      status: MagnetStatus.DRAFT,
    };

    if (creationMethod === 'UPLOAD') {
      // Direct upload
      if (!fileUrl || !fileName || !fileSize) {
        return NextResponse.json(
          { error: 'File details required for UPLOAD method' },
          { status: 400 }
        );
      }

      leadMagnetData = {
        ...leadMagnetData,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        status: MagnetStatus.ACTIVE,
      };
    } else if (creationMethod === 'TEMPLATE') {
      // Use template
      if (!templateId) {
        return NextResponse.json(
          { error: 'Template ID required for TEMPLATE method' },
          { status: 400 }
        );
      }

      const template = await prisma.leadMagnetTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      leadMagnetData = {
        ...leadMagnetData,
        fileUrl: template.templateUrl,
        mimeType: 'application/pdf',
        status: MagnetStatus.ACTIVE,
      };

      // Increment template use count
      await prisma.leadMagnetTemplate.update({
        where: { id: templateId },
        data: { useCount: { increment: 1 } },
      });
    } else if (creationMethod === 'AI_GENERATE') {
      // AI generation - create draft and process in background
      if (!aiPrompt) {
        return NextResponse.json(
          { error: 'AI prompt required for AI_GENERATE method' },
          { status: 400 }
        );
      }

      leadMagnetData = {
        ...leadMagnetData,
        status: MagnetStatus.DRAFT,
      };

      // Generate unique slug
      const slug = await generateUniqueSlug(name);
      leadMagnetData.slug = slug;

      // Create lead magnet record
      const leadMagnet = await prisma.leadMagnet.create({
        data: leadMagnetData,
      });

      // Step 5: For AI generation, we still increment usage even though it's async
      // Why: The user has committed to creating a lead magnet, so it counts against quota
      await RateLimitService.incrementUsage(userId, 'lead_magnets');

      // Trigger AI generation in background (in production, use job queue)
      // For now, return immediately
      return NextResponse.json(
        {
          leadMagnetId: leadMagnet.id,
          status: 'GENERATING',
          message: 'Generating your lead magnet... This may take 2-3 minutes.',
          estimatedTime: 180,
        },
        { status: 202 }
      );
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name);
    leadMagnetData.slug = slug;

    // Create lead magnet
    const leadMagnet = await prisma.leadMagnet.create({
      data: leadMagnetData,
    });

    // Step 3: Generate opt-in URL and embed code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const optInUrl = `${baseUrl}/magnet/${leadMagnet.slug}`;
    const embedCode = `<script src="${baseUrl}/embed/magnet/${leadMagnet.slug}.js"></script>`;

    // Step 4: Increment usage counter after successful creation
    // Why: We only increment AFTER the lead magnet is successfully created
    // This prevents counting failed attempts against the user's quota
    await RateLimitService.incrementUsage(userId, 'lead_magnets');

    return NextResponse.json({
      leadMagnetId: leadMagnet.id,
      status: leadMagnet.status,
      optInUrl,
      embedCode,
    });
  } catch (error) {
    logger.error('Error creating lead magnet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Require authentication
    // Why: Users should only see their own lead magnets
    const auth = await requireAuth(request);
    
    // Check if auth failed (AuthorizationResult with authorized: false)
    if ('authorized' in auth && !auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode || 401 }
      );
    }

    // Step 2: Extract userId from auth result
    // Why: The auth object contains the authenticated user's ID
    const userId = 'userId' in auth ? auth.userId : null;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as MagnetStatus | null;

    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assets: true,
        deliveries: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      leadMagnets: leadMagnets.map((magnet) => ({
        id: magnet.id,
        name: magnet.name,
        slug: magnet.slug,
        type: magnet.type,
        headline: magnet.headline,
        status: magnet.status,
        deliveryMethod: magnet.deliveryMethod,
        coverImageUrl: magnet.coverImageUrl,
        stats: {
          views: magnet.views,
          optIns: magnet.optIns,
          downloads: magnet.downloads,
          conversionRate: magnet.conversionRate
            ? parseFloat(magnet.conversionRate.toString())
            : 0,
        },
        assetCount: magnet.assets.length,
        deliveryCount: magnet.deliveries.length,
        createdAt: magnet.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Error fetching lead magnets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
