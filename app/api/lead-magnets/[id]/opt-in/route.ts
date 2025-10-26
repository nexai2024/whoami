/**
 * POST /api/lead-magnets/[id]/opt-in
 * Handle lead magnet opt-in form submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MagnetStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

interface OptInRequest {
  email: string;
  name?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadMagnetId = params.id;
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
    const existingDelivery = await prisma.leadMagnetDelivery.findFirst({
      where: {
        leadMagnetId,
        email: email.toLowerCase(),
      },
    });

    let delivery;

    if (existingDelivery) {
      // Resend email to existing subscriber (don't create new record)
      delivery = existingDelivery;

      // Update emailSent timestamp
      await prisma.leadMagnetDelivery.update({
        where: { id: existingDelivery.id },
        data: {
          updatedAt: new Date(),
        },
      });

      console.log(\`Resending lead magnet to existing subscriber: \${email}\`);
    } else {
      // Generate unique delivery token
      const deliveryToken = randomBytes(32).toString('hex');

      // Calculate token expiration (30 days from now)
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

      // Create new delivery record
      delivery = await prisma.leadMagnetDelivery.create({
        data: {
          leadMagnetId,
          email: email.toLowerCase(),
          name,
          deliveryToken,
          tokenExpiresAt,
          emailSent: true,
        },
      });

      // Increment optIns count
      await prisma.leadMagnet.update({
        where: { id: leadMagnetId },
        data: {
          optIns: { increment: 1 },
        },
      });

      console.log(\`Created new lead magnet delivery for: \${email}\`);
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
  const downloadUrl = \`\${baseUrl}/api/lead-magnets/download/\${delivery.deliveryToken}\`;

  // TODO: Implement actual email service (SendGrid, Resend, etc.)
  // For now, just log to console
  console.log('---');
  console.log('LEAD MAGNET DELIVERY EMAIL');
  console.log(\`To: \${delivery.email}\`);
  console.log(\`Subject: Your \${leadMagnet.name} is ready to download!\`);
  console.log('---');
  console.log(\`Hi \${delivery.name || 'there'}!\`);
  console.log('');
  console.log(\`Thanks for requesting "\${leadMagnet.name}".\`);
  console.log('');
  console.log('Click the link below to download:');
  console.log(downloadUrl);
  console.log('');
  console.log('Link expires in 30 days.');
  console.log('---');

  // TODO: Replace with actual email service
}
