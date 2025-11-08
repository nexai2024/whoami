/**
 * POST /api/lead-magnets/[id]/opt-in
 * Handle lead magnet opt-in form submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MagnetStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sendLeadMagnetDelivery } from '@/lib/services/emailService';

const prisma = new PrismaClient();

interface OptInRequest {
  email: string;
  name?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadMagnetId = id;
    const body: OptInRequest = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Find lead magnet
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: leadMagnetId },
    });

    if (!leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      );
    }

    // Check if lead magnet is active
    if (leadMagnet.status !== MagnetStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'This lead magnet is not currently available' },
        { status: 403 }
      );
    }

    // Check if email already opted in
    const normalizedEmail = email.trim().toLowerCase();

    const subscriber = await prisma.emailSubscriber.upsert({
      where: {
        pageId_email: {
          pageId: leadMagnetId,
          email: normalizedEmail,
        },
      },
      create: {
        email: normalizedEmail,
        pageId: leadMagnetId,
        pageType: 'LEAD_MAGNET',
        userId: leadMagnet.userId,
        name: name || null,
        source: 'lead-magnet-opt-in',
        tags: [
          'lead-magnet',
          ...(leadMagnet.slug ? [`magnet:${leadMagnet.slug}`] : []),
        ],
        isActive: true,
      },
      update: {
        name: name || undefined,
        pageType: 'LEAD_MAGNET',
        userId: leadMagnet.userId,
        source: 'lead-magnet-opt-in',
        isActive: true,
      },
    });

    const existingDelivery = await prisma.leadMagnetDelivery.findFirst({
      where: {
        leadMagnetId,
        email: normalizedEmail,
      },
    });

    let delivery;
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);
    const deliveryToken = randomBytes(16).toString('hex');

    if (existingDelivery) {
      // Resend email to existing subscriber (don't create new record)
      console.log(`Resending lead magnet to existing subscriber: ${email}`);

      delivery = await prisma.leadMagnetDelivery.update({
        where: { id: existingDelivery.id },
        data: {
          updatedAt: new Date(),
          name,
          deliveryToken,
          tokenExpiresAt,
          emailSent: true,
          emailSubscriberId: subscriber.id,
        },
      });
    } else {
      // Create new delivery record
      delivery = await prisma.leadMagnetDelivery.create({
        data: {
          leadMagnetId,
          email: normalizedEmail,
          name,
          deliveryToken,
          tokenExpiresAt,
          emailSent: true,
          emailSubscriberId: subscriber.id,
        },
      });

      // Increment optIns count
      await prisma.leadMagnet.update({
        where: { id: leadMagnetId },
        data: {
          optIns: { increment: 1 },
        },
      });

      console.log(`Created new lead magnet delivery for: ${email}`);
    }

    // Send delivery email
    try {
      await sendLeadMagnetDeliveryEmail(delivery, leadMagnet);
    } catch (emailError) {
      console.error('Error sending delivery email:', emailError);
      // Continue even if email fails - we've created the record
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for the download link',
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing opt-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send delivery email with download link
 */
async function sendLeadMagnetDeliveryEmail(delivery: any, leadMagnet: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const downloadUrl = `${baseUrl}/api/lead-magnets/download/${delivery.deliveryToken}`;

  try {
    await sendLeadMagnetDelivery(delivery.email, {
      recipientName: delivery.name || undefined,
      magnetName: leadMagnet.name,
      downloadUrl,
      expiresIn: '30 days',
    });

    await prisma.leadMagnetDelivery.update({
      where: { id: delivery.id },
      data: {
        delivered: true,
        deliveredAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to send lead magnet email via provider, logging fallback:', error);
    console.log('---');
    console.log('LEAD MAGNET DELIVERY EMAIL (FALLBACK LOG)');
    console.log(`To: ${delivery.email}`);
    console.log(`Subject: Your ${leadMagnet.name} is ready to download!`);
    console.log(downloadUrl);
    console.log('---');
  }
}
  // Email sending functionality not implemented yet.
  // In production, integrate with an email service like SendGrid, Resend, or SES here.
