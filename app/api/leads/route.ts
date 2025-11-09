import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Prisma, LeadStage } from '@prisma/client';
import {
  DEFAULT_MANUAL_PAGE_TYPE,
  emailSubscriberToLead,
  getManualPageId,
  LEAD_STAGE_VALUES,
  normalizeLeadStage,
  parseEstimatedValue,
  parseDateInput,
  parseTags,
  sanitizeString,
} from './utils';

type EmailSubscriberUpdateData = Prisma.EmailSubscriberUpdateInput & {
  lastActivityAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const search = sanitizeString(request.nextUrl.searchParams.get('search'));
    const stageParam = sanitizeString(request.nextUrl.searchParams.get('stage'));
    const pageTypeFilter = sanitizeString(request.nextUrl.searchParams.get('pageType'));
    const pageIdFilter = sanitizeString(request.nextUrl.searchParams.get('pageId'));
    const tagsParam = sanitizeString(request.nextUrl.searchParams.get('tags'));

    let pipelineStageFilter: LeadStage | undefined;
    if (stageParam) {
      const normalized = stageParam.toUpperCase();
      if (!LEAD_STAGE_VALUES.includes(normalized as LeadStage)) {
        return NextResponse.json({ error: 'Invalid stage filter' }, { status: 400 });
      }
      pipelineStageFilter = normalized as LeadStage;
    }

    const tagsFilter = tagsParam
      ? tagsParam
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    const where: Prisma.EmailSubscriberWhereInput = {
      userId,
      ...(pipelineStageFilter ? { pipelineStage: pipelineStageFilter } : {}),
      ...(pageTypeFilter ? { pageType: pageTypeFilter } : {}),
      ...(pageIdFilter ? { pageId: pageIdFilter } : {}),
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tagsFilter && tagsFilter.length > 0) {
      where.tags = { hasSome: tagsFilter };
    }

    const leads = await prisma.emailSubscriber.findMany({
      where,
      orderBy: [
        { lastActivityAt: 'desc' },
        { lastContactedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      leads: leads.map(emailSubscriberToLead),
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const email = sanitizeString(body.email);
    const name = sanitizeString(body.name);
    const phone = sanitizeString(body.phone);
    const source = sanitizeString(body.source);
    const company = sanitizeString(body.company);
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
    const stageId = sanitizeString(body.stageId);
    const pageIdInput = sanitizeString(body.pageId);
    const pageTypeInput = sanitizeString(body.pageType);
    const lastContactedInput = sanitizeString(body.lastContacted);
    const tags = parseTags(body.tags);
    const estimatedValue = parseEstimatedValue(body.estimatedValue);

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const now = new Date();
    const lastContactedAt = parseDateInput(lastContactedInput, now);
    const pipelineStage = normalizeLeadStage(stageId);
    const pageId = pageIdInput ?? getManualPageId(userId);
    const pageType = pageTypeInput ?? DEFAULT_MANUAL_PAGE_TYPE;
    const normalizedTags = tags ?? [];

    const baseData: Prisma.EmailSubscriberUncheckedCreateInput = {
      id: body.id ?? undefined,
      userId,
      pageId,
      pageType,
      email: email.toLowerCase(),
      name,
      phone,
      source,
      company,
      notes,
      tags: normalizedTags,
      pipelineStage,
      lastContactedAt,
      lastActivityAt: now,
      estimatedValue: estimatedValue ?? null,
      isActive: true,
    };

    const existing = await prisma.emailSubscriber.findUnique({
      where: {
        pageId_email: {
          pageId,
          email: email.toLowerCase(),
        },
      },
    });

    const shouldUpdateTags = Array.isArray(tags);
    const updateData: EmailSubscriberUpdateData = {
      name,
      phone,
      source,
      company,
      notes,
      pipelineStage: { set: pipelineStage },
      lastContactedAt,
      lastActivityAt: now,
      estimatedValue: estimatedValue ?? null,
      ...(shouldUpdateTags ? { tags: normalizedTags } : {}),
    };

    let subscriber;
    let status = 201;

    if (existing) {
      if (existing.userId !== userId) {
        return NextResponse.json({ error: 'Lead already exists for another user' }, { status: 409 });
      }

      subscriber = await prisma.emailSubscriber.update({
        where: { id: existing.id },
        data: updateData,
      });
      status = 200;
    } else {
      subscriber = await prisma.emailSubscriber.create({
        data: baseData,
      });
    }

    return NextResponse.json(
      {
        lead: emailSubscriberToLead(subscriber),
      },
      { status }
    );
  } catch (error) {
    logger.error('Error creating lead:', error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A lead with this email already exists for the selected page.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
