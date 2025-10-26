/**
 * GET /api/lead-magnets/[id] - Fetch full details of a single lead magnet
 * PATCH /api/lead-magnets/[id] - Update an existing lead magnet
 * DELETE /api/lead-magnets/[id] - Delete lead magnet (soft delete by setting status to ARCHIVED)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MagnetType, DeliveryMethod, MagnetStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id },
      include: {
        assets: true
      }
    });

    if (!leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (leadMagnet.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate opt-in URL and embed code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const optInUrl = `${baseUrl}/magnet/${leadMagnet.id}`;
    const embedCode = `<script src="${baseUrl}/embed/magnet/${leadMagnet.id}.js"></script>`;

    return NextResponse.json({
      id: leadMagnet.id,
      name: leadMagnet.name,
      description: leadMagnet.description,
      type: leadMagnet.type,
      headline: leadMagnet.headline,
      subheadline: leadMagnet.subheadline,
      benefits: leadMagnet.benefits,
      deliveryMethod: leadMagnet.deliveryMethod,
      deliveryDelay: leadMagnet.deliveryDelay,
      fileUrl: leadMagnet.fileUrl,
      fileName: leadMagnet.fileName,
      fileSize: leadMagnet.fileSize,
      mimeType: leadMagnet.mimeType,
      coverImageUrl: leadMagnet.coverImageUrl,
      brandColors: leadMagnet.brandColors,
      dripEnabled: leadMagnet.dripEnabled,
      dripSchedule: leadMagnet.dripSchedule,
      emailSubject: leadMagnet.emailSubject,
      emailBody: leadMagnet.emailBody,
      status: leadMagnet.status,
      views: leadMagnet.views,
      optIns: leadMagnet.optIns,
      downloads: leadMagnet.downloads,
      conversionRate: leadMagnet.conversionRate ? parseFloat(leadMagnet.conversionRate.toString()) : 0,
      emailCaptureBlockId: leadMagnet.emailCaptureBlockId,
      publishedAt: leadMagnet.publishedAt?.toISOString() || null,
      createdAt: leadMagnet.createdAt.toISOString(),
      updatedAt: leadMagnet.updatedAt.toISOString(),
      assets: leadMagnet.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        description: asset.description,
        fileUrl: asset.fileUrl,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType,
        order: asset.order,
        dripDay: asset.dripDay
      })),
      optInUrl,
      embedCode
    });
  } catch (error) {
    console.error('Error fetching lead magnet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      headline,
      subheadline,
      benefits,
      deliveryMethod,
      deliveryDelay,
      coverImageUrl,
      brandColors,
      emailSubject,
      emailBody,
      status
    } = body;

    const { id } = await params;
    // Find existing lead magnet
    const existingMagnet = await prisma.leadMagnet.findUnique({
      where: { id }
    });

    if (!existingMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingMagnet.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate fields if provided
    if (name !== undefined && (name.length < 3 || name.length > 100)) {
      return NextResponse.json(
        { error: 'Name must be 3-100 characters' },
        { status: 400 }
      );
    }

    if (headline !== undefined && (headline.length < 10 || headline.length > 200)) {
      return NextResponse.json(
        { error: 'Headline must be 10-200 characters' },
        { status: 400 }
      );
    }

    if (description !== undefined && description && description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (type !== undefined && !Object.values(MagnetType).includes(type as MagnetType)) {
      return NextResponse.json(
        { error: 'Invalid magnet type' },
        { status: 400 }
      );
    }

    if (deliveryMethod !== undefined && !Object.values(DeliveryMethod).includes(deliveryMethod as DeliveryMethod)) {
      return NextResponse.json(
        { error: 'Invalid delivery method' },
        { status: 400 }
      );
    }

    if (status !== undefined && !Object.values(MagnetStatus).includes(status as MagnetStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (coverImageUrl !== undefined && coverImageUrl) {
      try {
        new URL(coverImageUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid cover image URL format' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (headline !== undefined) updateData.headline = headline;
    if (subheadline !== undefined) updateData.subheadline = subheadline;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (deliveryMethod !== undefined) updateData.deliveryMethod = deliveryMethod;
    if (deliveryDelay !== undefined) updateData.deliveryDelay = deliveryDelay;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (brandColors !== undefined) updateData.brandColors = brandColors;
    if (emailSubject !== undefined) updateData.emailSubject = emailSubject;
    if (emailBody !== undefined) updateData.emailBody = emailBody;
    if (status !== undefined) updateData.status = status;

    // Update lead magnet
    await prisma.leadMagnet.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      leadMagnetId: id,
      message: 'Lead magnet updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead magnet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    // Find lead magnet
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id }
    });

    if (!leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (leadMagnet.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to ARCHIVED
    await prisma.leadMagnet.update({
      where: { id },
      data: { status: MagnetStatus.ARCHIVED }
    });

    return NextResponse.json({
      message: 'Lead magnet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead magnet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
