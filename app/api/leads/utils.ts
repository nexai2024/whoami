import type { EmailSubscriber } from '@prisma/client';

export interface LeadResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  stageId: string;
  tags: string[];
  source?: string | null;
  lastContacted: string;
  company?: string | null;
  notes?: string | null;
  estimatedValue?: number | null;
  pageId: string;
  pageType: string;
  createdAt: string;
  lastActivity: string;
}

export type LeadStage = EmailSubscriber['pipelineStage'];

export const LEAD_STAGE_VALUES: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export type LeadStageValue = LeadStage;

const stageValues = new Set<LeadStage>(LEAD_STAGE_VALUES);

export const DEFAULT_MANUAL_PAGE_TYPE = 'CRM';

export function getManualPageId(userId: string): string {
  return `crm-${userId}`;
}

export function normalizeLeadStage(stageId?: string | null): LeadStage {
  if (!stageId) {
    return 'NEW';
  }

  const upper = stageId.toUpperCase() as LeadStage;
  return stageValues.has(upper) ? upper : 'NEW';
}

export function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function parseTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const cleaned = value
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter((tag) => tag.length > 0);

  if (!cleaned.length) {
    return [];
  }

  return Array.from(new Set(cleaned));
}

export function parseEstimatedValue(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length
      ? Number(value)
      : NaN;

  if (Number.isNaN(numeric)) {
    return undefined;
  }

  return numeric;
}

export function parseDateInput(value: string | null | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed;
}

export function emailSubscriberToLead(record: EmailSubscriber): LeadResponse {
  const lastContactedAt = record.lastContactedAt ?? record.createdAt;
  const lastActivityAt = record.lastActivityAt ?? record.lastContactedAt ?? record.createdAt;

  return {
    id: record.id,
    name: record.name || record.email,
    email: record.email,
    phone: record.phone,
    stageId: record.pipelineStage.toLowerCase(),
    tags: Array.isArray(record.tags) ? record.tags : [],
    source: record.source,
    lastContacted: lastContactedAt.toISOString(),
    company: record.company,
    notes: record.notes,
    estimatedValue: record.estimatedValue ?? null,
    pageId: record.pageId,
    pageType: record.pageType,
    createdAt: record.createdAt.toISOString(),
    lastActivity: lastActivityAt.toISOString(),
  };
}

