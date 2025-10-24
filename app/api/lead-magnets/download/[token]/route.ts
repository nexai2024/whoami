/**
 * GET /api/lead-magnets/download/[token]
 * Download lead magnet file (public, token-based)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateDownloadUrl } from '@/lib/services/storageService';

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    token: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = params;

    // Look up delivery by token
    const delivery = await prisma.leadMagnetDelivery.findUnique({
      where: { deliveryToken: token },
      include: {
        leadMagnet: {
          include: {
            assets: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Invalid download link' },
        { status: 404 }
      );
    }

    // Check if token expired
    if (delivery.tokenExpiresAt && delivery.tokenExpiresAt < new Date()) {
      return NextResponse.json(
        {
          error: 'Link expired. Please request a new one.',
          expired: true,
        },
        { status: 410 }
      );
    }

    // Check if lead magnet is still active
    if (delivery.leadMagnet.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This lead magnet is no longer available' },
        { status: 404 }
      );
    }

    // Update delivery stats
    const isFirstDownload = !delivery.delivered;

    await prisma.leadMagnetDelivery.update({
      where: { id: delivery.id },
      data: {
        delivered: true,
        deliveredAt: delivery.deliveredAt || new Date(),
        downloadedCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    });

    // Update lead magnet download count (only on first download)
    if (isFirstDownload) {
      await prisma.leadMagnet.update({
        where: { id: delivery.leadMagnetId },
        data: {
          downloads: { increment: 1 },
        },
      });
    }

    // For multi-asset lead magnets (courses), return different file based on progress
    let fileUrl = delivery.leadMagnet.fileUrl;

    if (delivery.leadMagnet.assets.length > 0) {
      // Drip course logic
      if (delivery.leadMagnet.dripEnabled) {
        const currentAsset =
          delivery.leadMagnet.assets[delivery.currentAssetIndex];

        if (currentAsset) {
          fileUrl = currentAsset.fileUrl;
        }
      } else {
        // Return first asset or zip of all assets
        fileUrl = delivery.leadMagnet.assets[0].fileUrl;
      }
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File not available' },
        { status: 404 }
      );
    }

    // Generate signed URL for secure download
    console.log('fileUrl', fileUrl);
    const signedUrl = await generateDownloadUrl(
      fileUrl,
    );

    console.log('signedUrl', signedUrl);

    // Redirect to signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract storage key from full URL
 */
function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.substring(1);
  } catch {
    // If not a full URL, assume it's already a key
    return url;
  }
}
