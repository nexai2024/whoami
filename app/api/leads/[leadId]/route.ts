import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/utils/logger';
import {
  deleteLead,
  LeadNotFoundError,
  LeadValidationError,
  updateLead,
  type LeadUpdateInput,
  getLeadCacheTag,
} from '@/lib/services/leadService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await params;
    const body = await request.json();
    const result = await updateLead({
      userId,
      leadId,
      updates: body as LeadUpdateInput,
    });

    revalidateTag(getLeadCacheTag(userId), {});

    return NextResponse.json({ lead: result });
  } catch (error) {
    if (error instanceof LeadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof LeadNotFoundError) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    logger.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await params;
    await deleteLead({
      userId,
      leadId,
    });

    revalidateTag(getLeadCacheTag(userId), {});

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    logger.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

