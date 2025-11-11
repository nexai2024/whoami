import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';
import {
  DEFAULT_MANUAL_PAGE_TYPE,
  emailSubscriberToLead,
  getManualPageId,
  LEAD_STAGE_VALUES,
  normalizeLeadStage,
  parseDateInput,
  parseEstimatedValue,
  parseTags,
  sanitizeString,
  type LeadResponse,
  type LeadStage,
} from '@/app/api/leads/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION_ERROR' | 'CONFLICT_ERROR' | 'NOT_FOUND_ERROR' | 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = 'LeadServiceError';
  }
}

export class LeadValidationError extends LeadServiceError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'LeadValidationError';
  }
}

export class LeadConflictError extends LeadServiceError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR');
    this.name = 'LeadConflictError';
  }
}

export class LeadNotFoundError extends LeadServiceError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR');
    this.name = 'LeadNotFoundError';
  }
}

export interface LeadListFilterInput {
  search?: unknown;
  stage?: unknown;
  pageType?: unknown;
  pageId?: unknown;
  tags?: unknown;
}

export interface LeadListFilters {
  search?: string;
  stage?: LeadStage;
  pageType?: string;
  pageId?: string;
  tags?: string[];
}

export interface LeadUpsertInput {
  id?: unknown;
  email: unknown;
  name?: unknown;
  phone?: unknown;
  source?: unknown;
  company?: unknown;
  notes?: unknown;
  stageId?: unknown;
  pageId?: unknown;
  pageType?: unknown;
  lastContacted?: unknown;
  tags?: unknown;
  estimatedValue?: unknown;
}

export interface LeadUpdateInput {
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  source?: unknown;
  company?: unknown;
  notes?: unknown;
  stageId?: unknown;
  lastContacted?: unknown;
  tags?: unknown;
  estimatedValue?: unknown;
}

interface NormalizedLeadUpsertInput {
  id?: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  company: string | null;
  notes: string | null;
  pipelineStage: LeadStage;
  pageId?: string | null;
  pageType?: string | null;
  lastContacted?: string | null;
  tags?: string[];
  shouldUpdateTags: boolean;
  estimatedValue?: number | null | undefined;
}

interface NormalizedLeadUpdateInput {
  email?: string;
  name?: string | null;
  phone?: string | null;
  source?: string | null;
  company?: string | null;
  notes?: string | null;
  pipelineStage?: LeadStage;
  lastContacted?: string | null;
  tags?: string[];
  shouldUpdateTags: boolean;
  estimatedValue?: number | null | undefined;
}

export interface UpsertLeadOptions {
  userId: string;
  payload: LeadUpsertInput;
}

export interface UpsertLeadResult {
  lead: LeadResponse;
  created: boolean;
}

export interface UpdateLeadOptions {
  userId: string;
  leadId: string;
  updates: LeadUpdateInput;
}

export interface DeleteLeadOptions {
  userId: string;
  leadId: string;
}

export function getLeadCacheTag(userId: string): string {
  return `leads:user:${userId}`;
}

export function normalizeLeadFilterForCache(filters: LeadListFilters): LeadListFilters {
  return {
    search: filters.search,
    stage: filters.stage,
    pageType: filters.pageType,
    pageId: filters.pageId,
    tags: filters.tags ? [...filters.tags].sort() : undefined,
  };
}

export function parseLeadListFilters(input: LeadListFilterInput): LeadListFilters {
  const search = sanitizeString(input.search);
  const pageType = sanitizeString(input.pageType);
  const pageId = sanitizeString(input.pageId);

  let tags: string[] | undefined;
  if (Array.isArray(input.tags)) {
    tags = parseTags(input.tags) ?? [];
  } else if (typeof input.tags === 'string') {
    const splitTags = input.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    tags = parseTags(splitTags) ?? [];
  } else if (input.tags !== undefined && input.tags !== null) {
    throw new LeadValidationError('Tags must be an array of strings or a comma-separated string', 'tags');
  }

  const stageParam = sanitizeString(input.stage);
  let stage: LeadStage | undefined;
  if (stageParam) {
    const normalized = stageParam.toUpperCase();
    if (!LEAD_STAGE_VALUES.includes(normalized as LeadStage)) {
      throw new LeadValidationError('Invalid stage filter', 'stage');
    }
    stage = normalized as LeadStage;
  }

  return {
    search: search ?? undefined,
    pageType: pageType ?? undefined,
    pageId: pageId ?? undefined,
    stage,
    tags,
  };
}

function normalizeLeadUpsertInput(input: LeadUpsertInput): NormalizedLeadUpsertInput {
  const email = sanitizeString(input.email);
  if (!email) {
    throw new LeadValidationError('Email is required', 'email');
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new LeadValidationError('Invalid email address', 'email');
  }

  const id = typeof input.id === 'string' && input.id.trim().length ? input.id : undefined;
  const name = sanitizeString(input.name);
  const phone = sanitizeString(input.phone);
  const source = sanitizeString(input.source);
  const company = sanitizeString(input.company);
  const notes = typeof input.notes === 'string' ? input.notes.trim() || null : null;
  const stageId = sanitizeString(input.stageId);
  const pageId = sanitizeString(input.pageId);
  const pageType = sanitizeString(input.pageType);
  const lastContacted = sanitizeString(input.lastContacted);

  let normalizedTags: string[] | undefined;
  let shouldUpdateTags = false;
  if (input.tags !== undefined) {
    shouldUpdateTags = true;
    if (Array.isArray(input.tags)) {
      normalizedTags = parseTags(input.tags) ?? [];
    } else if (typeof input.tags === 'string') {
      const parsed = parseTags(
        input.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      );
      normalizedTags = parsed ?? [];
    } else if (input.tags === null) {
      normalizedTags = [];
    } else {
      throw new LeadValidationError('Tags must be an array of strings or a comma-separated string', 'tags');
    }
  }

  const estimatedValue = parseEstimatedValue(input.estimatedValue);

  return {
    id,
    email: email.toLowerCase(),
    name: name ?? null,
    phone: phone ?? null,
    source: source ?? null,
    company: company ?? null,
    notes,
    pipelineStage: normalizeLeadStage(stageId),
    pageId: pageId ?? null,
    pageType: pageType ?? null,
    lastContacted: lastContacted ?? null,
    tags: normalizedTags,
    shouldUpdateTags,
    estimatedValue,
  };
}

function normalizeLeadUpdateInput(input: LeadUpdateInput): NormalizedLeadUpdateInput {
  const normalized: NormalizedLeadUpdateInput = {
    shouldUpdateTags: false,
  };

  if ('email' in input) {
    const email = sanitizeString(input.email);
    if (!email) {
      throw new LeadValidationError('Email cannot be empty', 'email');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new LeadValidationError('Invalid email address', 'email');
    }
    normalized.email = email.toLowerCase();
  }

  if ('name' in input) {
    normalized.name = sanitizeString(input.name);
  }

  if ('phone' in input) {
    normalized.phone = sanitizeString(input.phone);
  }

  if ('source' in input) {
    normalized.source = sanitizeString(input.source);
  }

  if ('company' in input) {
    normalized.company = sanitizeString(input.company);
  }

  if ('notes' in input) {
    if (typeof input.notes === 'string') {
      const trimmed = input.notes.trim();
      normalized.notes = trimmed.length ? trimmed : null;
    } else if (input.notes == null) {
      normalized.notes = null;
    } else {
      throw new LeadValidationError('Notes must be a string', 'notes');
    }
  }

  if ('stageId' in input) {
    const stageId = sanitizeString(input.stageId);
    if (stageId) {
      normalized.pipelineStage = normalizeLeadStage(stageId);
    }
  }

  if ('lastContacted' in input) {
    const lastContacted = sanitizeString(input.lastContacted);
    normalized.lastContacted = lastContacted ?? null;
  }

  if ('tags' in input) {
    normalized.shouldUpdateTags = true;
    if (Array.isArray(input.tags)) {
      normalized.tags = parseTags(input.tags) ?? [];
    } else if (typeof input.tags === 'string') {
      const parsed = parseTags(
        input.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      );
      normalized.tags = parsed ?? [];
    } else if (input.tags === null) {
      normalized.tags = [];
    } else {
      throw new LeadValidationError('Tags must be an array of strings or a comma-separated string', 'tags');
    }
  }

  if ('estimatedValue' in input) {
    normalized.estimatedValue = parseEstimatedValue(input.estimatedValue);
  }

  return normalized;
}

export async function listLeads({
  userId,
  filters,
}: {
  userId: string;
  filters: LeadListFilters;
}): Promise<LeadResponse[]> {
  const whereConditions: Prisma.EmailSubscriberWhereInput = {
    userId,
  };

  if (filters.stage) {
    whereConditions.pipelineStage = filters.stage;
  }

  if (filters.pageType) {
    whereConditions.pageType = filters.pageType;
  }

  if (filters.pageId) {
    whereConditions.pageId = filters.pageId;
  }

  if (filters.tags && filters.tags.length > 0) {
    whereConditions.tags = { hasSome: filters.tags };
  }

  if (filters.search) {
    whereConditions.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const leads = await prisma.emailSubscriber.findMany({
    where: whereConditions,
    orderBy: [{ lastActivityAt: 'desc' }, { lastContactedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return leads.map(emailSubscriberToLead);
}

async function getLeadRecordForUser(userId: string, leadId: string) {
  const lead = await prisma.emailSubscriber.findUnique({
    where: { id: leadId },
  });

  if (!lead || lead.userId !== userId) {
    throw new LeadNotFoundError('Lead not found');
  }

  return lead;
}

export async function upsertLead({ userId, payload }: UpsertLeadOptions): Promise<UpsertLeadResult> {
  const normalized = normalizeLeadUpsertInput(payload);
  const now = new Date();
  const lastContactedAt = parseDateInput(normalized.lastContacted, now);
  const pageId = normalized.pageId ?? getManualPageId(userId);
  const pageType = normalized.pageType ?? DEFAULT_MANUAL_PAGE_TYPE;

  const baseData: Prisma.EmailSubscriberUncheckedCreateInput = {
    id: normalized.id,
    userId,
    pageId,
    pageType,
    email: normalized.email,
    name: normalized.name,
    phone: normalized.phone,
    source: normalized.source,
    company: normalized.company,
    notes: normalized.notes,
    tags: normalized.tags ?? [],
    pipelineStage: normalized.pipelineStage,
    lastContactedAt,
    lastActivityAt: now,
    estimatedValue: normalized.estimatedValue ?? null,
    isActive: true,
  };

  const existing = await prisma.emailSubscriber.findUnique({
    where: {
      pageId_email: {
        pageId,
        email: normalized.email,
      },
    },
  });

  if (existing && existing.userId !== userId) {
    throw new LeadConflictError('Lead already exists for another user');
  }

  let subscriber;
  let created = false;

  if (existing) {
    const updateData: Prisma.EmailSubscriberUncheckedUpdateInput = {
      name: normalized.name,
      phone: normalized.phone,
      source: normalized.source,
      company: normalized.company,
      notes: normalized.notes,
      pipelineStage: { set: normalized.pipelineStage },
      lastContactedAt,
      lastActivityAt: now,
      estimatedValue: normalized.estimatedValue ?? null,
    };

    if (normalized.shouldUpdateTags) {
      updateData.tags = normalized.tags ?? [];
    }

    subscriber = await prisma.emailSubscriber.update({
      where: { id: existing.id },
      data: updateData,
    });
  } else {
    subscriber = await prisma.emailSubscriber.create({
      data: baseData,
    });
    created = true;
  }

  return {
    lead: emailSubscriberToLead(subscriber),
    created,
  };
}

export async function updateLead({
  userId,
  leadId,
  updates,
}: UpdateLeadOptions): Promise<LeadResponse> {
  const existing = await getLeadRecordForUser(userId, leadId);
  const normalized = normalizeLeadUpdateInput(updates);

  if (
    normalized.email === undefined &&
    normalized.name === undefined &&
    normalized.phone === undefined &&
    normalized.source === undefined &&
    normalized.company === undefined &&
    normalized.notes === undefined &&
    normalized.pipelineStage === undefined &&
    normalized.lastContacted === undefined &&
    !normalized.shouldUpdateTags &&
    normalized.estimatedValue === undefined
  ) {
    return emailSubscriberToLead(existing);
  }

  const now = new Date();
  const updateData: Prisma.EmailSubscriberUncheckedUpdateInput = {
    lastActivityAt: now,
  };

  if (normalized.email !== undefined) {
    updateData.email = normalized.email;
  }

  if (normalized.name !== undefined) {
    updateData.name = normalized.name;
  }

  if (normalized.phone !== undefined) {
    updateData.phone = normalized.phone;
  }

  if (normalized.source !== undefined) {
    updateData.source = normalized.source;
  }

  if (normalized.company !== undefined) {
    updateData.company = normalized.company;
  }

  if (normalized.notes !== undefined) {
    updateData.notes = normalized.notes;
  }

  if (normalized.pipelineStage !== undefined) {
    updateData.pipelineStage = { set: normalized.pipelineStage };
  }

  if (normalized.lastContacted !== undefined) {
    updateData.lastContactedAt = parseDateInput(
      normalized.lastContacted,
      existing.lastContactedAt ?? existing.createdAt
    );
  }

  if (normalized.shouldUpdateTags) {
    updateData.tags = normalized.tags ?? [];
  }

  if (normalized.estimatedValue !== undefined) {
    updateData.estimatedValue = normalized.estimatedValue ?? null;
  }

  const updated = await prisma.emailSubscriber.update({
    where: { id: existing.id },
    data: updateData,
  });

  return emailSubscriberToLead(updated);
}

export async function deleteLead({ userId, leadId }: DeleteLeadOptions): Promise<void> {
  const existing = await getLeadRecordForUser(userId, leadId);
  await prisma.emailSubscriber.delete({
    where: { id: existing.id },
  });
}

