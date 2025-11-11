import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';
import {
  LeadConflictError,
  LeadValidationError,
  listLeads,
  parseLeadListFilters,
  getLeadCacheTag,
  normalizeLeadFilterForCache,
  upsertLead,
} from '@/lib/services/leadService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tagsFromParams = request.nextUrl.searchParams.getAll('tags');
    const filters = parseLeadListFilters({
      search: request.nextUrl.searchParams.get('search'),
      stage: request.nextUrl.searchParams.get('stage'),
      pageType: request.nextUrl.searchParams.get('pageType'),
      pageId: request.nextUrl.searchParams.get('pageId'),
      tags: tagsFromParams.length > 0 ? tagsFromParams : request.nextUrl.searchParams.get('tags'),
    });

    const normalizedFilters = normalizeLeadFilterForCache(filters);
    const cacheKey = JSON.stringify(normalizedFilters);

    const cachedList = unstable_cache(
      () =>
        listLeads({
          userId,
          filters: normalizedFilters,
        }),
      ['lead-service:list', userId, cacheKey],
      {
        tags: [getLeadCacheTag(userId)],
      }
    );

    const leads = await cachedList();

    return NextResponse.json({ leads });
  } catch (error) {
    if (error instanceof LeadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
    const payload = {
      ...body,
      stageId: body.stageId,
      tags: body.tags,
    };

    const result = await upsertLead({
      userId,
      payload,
    });

    revalidateTag(getLeadCacheTag(userId), {});

    return NextResponse.json(
      {
        lead: result.lead,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof LeadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof LeadConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

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
