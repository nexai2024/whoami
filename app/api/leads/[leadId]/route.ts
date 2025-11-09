import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import type { Prisma } from '@prisma/client';
import {
  emailSubscriberToLead,
  normalizeLeadStage,
  parseDateInput,
  parseEstimatedValue,
  parseTags,
  sanitizeString,
} from '../utils';

async function getLeadForUser(leadId: string, userId: string) {
  const lead = await prisma.emailSubscriber.findUnique({ where: { id: leadId } });
  if (!lead || lead.userId !== userId) {
    return null;
  }

  return lead;
}

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
    const existingLead = await getLeadForUser(leadId, userId);

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const body = await request.json();
    const now = new Date();

    const updateData: Record<string, unknown> = {
      lastActivityAt: now,
    };

    if ('name' in body) {
      updateData.name = sanitizeString(body.name);
    }

    if ('email' in body) {
      const newEmail = sanitizeString(body.email);
      if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }
        updateData.email = newEmail.toLowerCase();
      }
    }

    if ('phone' in body) {
      updateData.phone = sanitizeString(body.phone);
    }

    if ('company' in body) {
      updateData.company = sanitizeString(body.company);
    }

    if ('source' in body) {
      updateData.source = sanitizeString(body.source);
    }

    if ('notes' in body) {
      if (typeof body.notes === 'string') {
        const trimmed = body.notes.trim();
        updateData.notes = trimmed.length ? trimmed : null;
      } else if (body.notes == null) {
        updateData.notes = null;
      }
    }

    if ('tags' in body) {
      const tags = parseTags(body.tags);
      updateData.tags = tags ?? [];
    }

    if ('stageId' in body) {
      const stageId = sanitizeString(body.stageId);
      const normalizedStage = stageId ? normalizeLeadStage(stageId) : existingLead.pipelineStage;
      updateData.pipelineStage = {
        set: normalizedStage,
      };
    }

    if ('lastContacted' in body) {
      const lastContacted = sanitizeString(body.lastContacted);
      updateData.lastContactedAt = parseDateInput(
        lastContacted,
        existingLead.lastContactedAt ?? existingLead.createdAt
      );
    }

    const estimatedValue = parseEstimatedValue(body.estimatedValue);
    if (estimatedValue !== undefined) {
      updateData.estimatedValue = estimatedValue;
    }

    const updatedLead = await prisma.emailSubscriber.update({
      where: { id: existingLead.id },
      data: updateData as Prisma.EmailSubscriberUncheckedUpdateInput,
    });

    return NextResponse.json({ lead: emailSubscriberToLead(updatedLead) });
  } catch (error) {
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
    const existingLead = await getLeadForUser(leadId, userId);

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await prisma.emailSubscriber.delete({ where: { id: existingLead.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

