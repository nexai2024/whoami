/**
 * POST /api/lead-magnets/[id]/opt-in
 * User opts in to receive lead magnet (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, DeliveryMethod } from '@prisma/client';
import crypto from 'crypto';
import emailService from '@/lib/services/emailService';
import storageService from '@/lib/services/storageService';

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { email, name, source, medium, campaign } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get lead magnet
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id },
      include: {
        assets: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!leadMagnet || leadMagnet.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Lead magnet not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user already opted in
    let existingDelivery = await prisma.leadMagnetDelivery.findFirst({
      where: {
        leadMagnetId: id,
        email,
      },
    });

    let deliveryToken: string;

    if (existingDelivery) {
      // Return existing token
      deliveryToken = existingDelivery.deliveryToken;
    } else {
      // Create new delivery record
      deliveryToken = crypto.randomBytes(32).toString('hex');

      // Set token expiry based on delivery method
      const tokenExpiresAt =
        leadMagnet.deliveryMethod === DeliveryMethod.INSTANT_DOWNLOAD
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          : null; // No expiry for email delivery

      // Check if email subscriber exists
      const emailSubscriber = await prisma.emailSubscriber.findFirst({
        where: { email },
      });

      const delivery = await prisma.leadMagnetDelivery.create({
        data: {
          leadMagnetId: id,
          email,
          name: name || null,
          emailSubscriberId: emailSubscriber?.id || null,
          deliveryToken,
          tokenExpiresAt,
          source: source || null,
          medium: medium || null,
          campaign: campaign || null,
        },
      });

      // Update lead magnet stats
      await prisma.leadMagnet.update({
        where: { id },
        data: {
          optIns: { increment: 1 },
          conversionRate: {
            // Recalculate conversion rate
            set: leadMagnet.views > 0
              ? ((leadMagnet.optIns + 1) / leadMagnet.views) * 100
              : 0,
          },
        },
      });

      // Add to email subscribers if not exists
      if (!emailSubscriber) {
        await prisma.emailSubscriber.create({
          data: {
            pageId: '', // TODO: Link to actual page if available
            email,
            name: name || null,
            source: `lead_magnet:${leadMagnet.name}`,
            tags: ['lead_magnet', leadMagnet.type.toLowerCase()],
          },
        });
      }

      // Schedule email delivery if needed
      if (
        leadMagnet.deliveryMethod === DeliveryMethod.EMAIL_DELIVERY ||
        leadMagnet.deliveryMethod === DeliveryMethod.HYBRID
      ) {
        // Send delivery email after delay
        const deliveryDate = new Date(
          Date.now() + leadMagnet.deliveryDelay * 60 * 1000
        );

        if (leadMagnet.deliveryDelay === 0) {
          // Send immediately
          await sendDeliveryEmail(delivery.id, leadMagnet);
        } else {
          // TODO: Schedule email via job queue
          console.log(
            `Scheduled email delivery for ${deliveryDate.toISOString()}`
          );
        }
      }
    }

    // Generate download URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/lead-magnets/download/${deliveryToken}`;

    return NextResponse.json({
      success: true,
      deliveryToken,
      deliveryMethod: leadMagnet.deliveryMethod,
      downloadUrl,
      message:
        leadMagnet.deliveryMethod === DeliveryMethod.EMAIL_DELIVERY
          ? 'Check your email for the download link!'
          : 'Your download is ready!',
    });
  } catch (error) {
    console.error('Error processing opt-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send delivery email for lead magnet
 */
async function sendDeliveryEmail(
  deliveryId: string,
  leadMagnet: any
): Promise<void> {
  try {
    const delivery = await prisma.leadMagnetDelivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/lead-magnets/download/${delivery.deliveryToken}`;

    const expiresIn = delivery.tokenExpiresAt
      ? `${Math.ceil(
          (delivery.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )} days`
      : undefined;

    await emailService.sendLeadMagnetDelivery(delivery.email, {
      recipientName: delivery.name || undefined,
      magnetName: leadMagnet.name,
      downloadUrl,
      expiresIn,
    });

    // Update delivery record
    await prisma.leadMagnetDelivery.update({
      where: { id: deliveryId },
      data: {
        emailSent: true,
      },
    });
  } catch (error) {
    console.error('Error sending delivery email:', error);
    throw error;
  }
}
