/**
 * POST /api/templates/[id]/purchase - Purchase a paid template
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch template
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isPaid || !template.price) {
      return NextResponse.json(
        { error: 'Template is not available for purchase' },
        { status: 400 }
      );
    }

    if (template.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot purchase your own template' },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.templatePurchase.findFirst({
      where: {
        templateId: id,
        buyerId: userId,
        paymentStatus: 'completed'
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this template' },
        { status: 400 }
      );
    }

    // Calculate fees (platform takes 30%, seller gets 70%)
    const price = Number(template.price);
    const platformFee = price * 0.30;
    const sellerEarnings = price * 0.70;
    const commission = template.commissionRate 
      ? price * (Number(template.commissionRate) / 100)
      : 0;

    // Create purchase record
    const purchase = await prisma.templatePurchase.create({
      data: {
        templateId: id,
        buyerId: userId,
        sellerId: template.userId || '',
        price,
        currency: template.currency || 'USD',
        commission,
        platformFee,
        sellerEarnings,
        paymentStatus: 'pending' // In production, integrate with Stripe
      }
    });

    // TODO: Integrate with Stripe for actual payment processing
    // For now, mark as completed (in production, wait for Stripe webhook)
    await prisma.templatePurchase.update({
      where: { id: purchase.id },
      data: { paymentStatus: 'completed' }
    });

    // Update template stats
    await prisma.pageTemplate.update({
      where: { id },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: price }
      }
    });

    // Update seller's creator profile
    if (template.userId) {
      await prisma.templateCreatorProfile.upsert({
        where: { userId: template.userId },
        create: {
          userId: template.userId,
          totalSales: 1,
          totalRevenue: sellerEarnings
        },
        update: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: sellerEarnings }
        }
      });
    }

    return NextResponse.json({
      purchase: {
        ...purchase,
        createdAt: purchase.createdAt.toISOString()
      },
      message: 'Template purchased successfully!'
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






