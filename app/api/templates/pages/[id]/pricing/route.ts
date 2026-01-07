/**
 * PATCH /api/templates/pages/[id]/pricing - Update template pricing
 */

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function PATCH(
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

    const template = await prisma.pageTemplate.findUnique({
      where: { id }
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized' },
        { status: 404 }
      );
    }

    const { price, isPaid, licenseType } = body;

    const updated = await prisma.pageTemplate.update({
      where: { id },
      data: {
        price: isPaid && price ? price : null,
        isPaid: isPaid || false,
        licenseType: licenseType || (isPaid ? 'paid' : 'free')
      }
    });

    return NextResponse.json({
      template: {
        ...updated,
        price: updated.price ? Number(updated.price) : null,
        totalRevenue: updated.totalRevenue ? Number(updated.totalRevenue) : 0
      }
    });
  } catch (error) {
    console.error('Error updating template pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






